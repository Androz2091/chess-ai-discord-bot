const { createCanvas, loadImage } = require('canvas');

const {
    cols,
    black,
    filePaths,
  } = require('chess-image-generator/src/config/index');
const path = require('path');

module.exports.buildImage = async (imageGenerator, flipped, padding, colors = {
    background: [0, 66, 151, 0.58],
    dark: [0, 66, 151, 1],
    light: [255, 255, 255, 1],
}) => {

    if (!global.appRoot) return console.log(`global.appRoot is not defined.`);

    const canvas = createCanvas(imageGenerator.size + padding[2], imageGenerator.size + padding[3]);
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.rect(
        0,
        0,
        imageGenerator.size + padding[2],
        imageGenerator.size + padding[3],
    );
    ctx.fillStyle = `rgba(${colors.background[0]}, ${colors.background[1]}, ${colors.background[2]}, ${colors.background[3] || 1})`;
    ctx.fill();


    // insert logo.png (429 × 117) at top
    const logo = await loadImage(path.join(__dirname, 'logo.png'));
    await ctx.drawImage(
        logo,
        (imageGenerator.size + padding[2]) / 2 - (429 / 2) / 2,
        40,
        429 / 2,
        117 / 2
    );

    ctx.beginPath();
    ctx.rect(
        0 + padding[0],
        0 + padding[1],
        imageGenerator.size - padding[0],
        imageGenerator.size - padding[1],
    );
    ctx.fillStyle = `rgba(${colors.light[0]}, ${colors.light[1]}, ${colors.light[2]}, ${colors.light[3] || 1})`;
    ctx.fill();

    const newXSize = imageGenerator.size - padding[0];
    const newYSize = imageGenerator.size - padding[1];

    for (let i = 0; i < 8; i += 1) {
        for (let j = 0; j < 8; j += 1) {
        
            if ((i + j) % 2 === 0) {
                ctx.beginPath();
                ctx.rect(
                    (((newXSize) / 8) * ((7-j)+1)) - ((newXSize) / 8) + padding[0],
                    (((newYSize) / 8) * (i)) + padding[1],
                    ((newXSize) / 8),
                    ((newYSize) / 8)
                );
                ctx.fillStyle = `rgba(${colors.dark[0]}, ${colors.dark[1]}, ${colors.dark[2]}, ${colors.dark[3] || 1})`;
                ctx.fill();
            }

            const piece = imageGenerator.chess.get(cols[7 - j] + ((7 - i) + 1));
                if (piece && piece.type !== '' && black.includes(piece.type.toLowerCase())) {
                const image = `resources/${imageGenerator.style}/${filePaths[`${piece.color}${piece.type}`]}.png`;
                const imageFile = await loadImage(path.join(global.appRoot, 'node_modules', 'chess-image-generator', 'src', image));
                await ctx.drawImage(
                    imageFile,
                    (((newXSize) / 8) * ((7-j)+1)) - ((newXSize) / 8) + padding[0],
                    (((newYSize) / 8) * (i)) + padding[1],
                    ((newXSize) / 8),
                    ((newYSize) / 8)
                );
            }

        }
    }

    const chessLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const chessNumbers = ['1', '2', '3', '4', '5', '6', '7', '8'];

    if (!flipped) {
        chessLetters.reverse();
        chessNumbers.reverse();
    }

    ctx.font = 'bold 30px Lato';
    ctx.fillStyle = 'white';

    for (let i = 0; i < 8; i += 1) {
        // write left and bottom
        ctx.fillText(chessLetters[i], (((newXSize) / 8) * ((7-i)+1)) - ((newXSize) / 8) + padding[0] + 50, (newYSize) + padding[1] + 50);
        ctx.fillText(chessNumbers[i], 50, (((newYSize) / 8) * (i)) + padding[1] + 60);
        // write right and top
        ctx.fillText(chessLetters[i], (((newXSize) / 8) * ((7-i)+1)) - ((newXSize) / 8) + padding[0] + 50, padding[1] - 30);
        ctx.fillText(chessNumbers[i], (newXSize) + padding[0] + 30, (((newYSize) / 8) * (i)) + padding[1] + 60);
    }

    return canvas.toBuffer();
}