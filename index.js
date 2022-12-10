const { calculateBestMove, initGame } = require("chess-ai");
const { Chess } = require('chess.js');
const ChessImageGenerator = require('chess-image-generator');

global.appRoot = __dirname;

const { config } = require('dotenv');
config();

const { Client, IntentsBitField, EmbedBuilder } = require('discord.js');
const { buildImage } = require("./chess-image");

const client = new Client({
    intents: [IntentsBitField.Flags.Guilds]
});

client.on('ready', () => {
    console.log(`🔗 Logged in as ${client.user.tag}`);
});

const games = new Map();

const generateContentFromGame = async (chess, user, game) => {

    const embed = new EmbedBuilder()
        .setDescription(`**${chess.turn() === 'w' ? 'White' : 'Black'}'s turn (${chess.turn() === 'w' ? 'you' : 'AI'})**. Use </move:1051043328541597767> to make a move.`)
        .setImage('attachment://board.png')
        .setAuthor({
            name: `${user.tag}'s StoicDAO Chess Game`,
            iconURL: user.displayAvatarURL()
        })
        .setColor(chess.turn() === 'w' ? 'White' : 'DarkButNotBlack')
        .addFields([
            {
                name: 'White (you)',
                value: chess.history({ verbose: true }).filter(move => move.color === 'w').map(move => move.from + move.to).join(' ') || 'None',
            },
            {
                name: 'Black (AI)',
                value: chess.history({ verbose: true }).filter(move => move.color === 'b').map(move => move.from + move.to).join(' ') || 'None',
            }
        ])
        .setFooter({
            text: `StoicDAO AI time: ${game.computationTimes.length ? Math.round((game.computationTimes.reduce((a, b) => a + b, 0) / game.computationTimes.length)) : 'N/A'}ms`
        })
        .setTimestamp();

    const padding = [100,200,100,100];

    const imageGenerator = new ChessImageGenerator({
        size: 1048,
        style: 'leipzig'
    });

    imageGenerator.loadFEN(chess.fen());

    return {
        embeds: [embed],
        files: [{
            name: 'board.png',
            attachment: await buildImage(imageGenerator, chess.turn() === 'b', padding)
        }]
    }

}

client.on('interactionCreate', async (interaction) => {

    if (interaction.isAutocomplete() && interaction.commandName === 'move') {

        const game = games.get(interaction.user.id);
        if (!game) {
            return interaction.respond([{
                name: 'You must start a game before using /move.',
                value: '0'
            }]);
        }

        const moves = game.chess.moves({ verbose: true });
        const filteredMoves = moves.filter(move => !interaction.options.getFocused() || (move.from + move.to).startsWith(interaction.options.getFocused()));

        const options = filteredMoves.slice(0, 25).map(move => ({
            name: move.from + move.to,
            value: move.from + move.to
        }));

        interaction.respond(options);

    }

    if (interaction.isCommand() && interaction.commandName === 'chess') {

        if (games.has(interaction.user.id)) return interaction.reply({ content: 'You are already playing a game. Use /give-up to cancel it.', ephemeral: true });

        await interaction.deferReply();

        const chess = new Chess();
        games.set(interaction.user.id, {
            chess,
            interaction,
            computationTimes: []
        });

        const content = await generateContentFromGame(chess, interaction.user, {
            computationTimes: []
        });
        interaction.followUp(content);

    }

    if (interaction.isCommand() && interaction.commandName === 'move') {

        const game = games.get(interaction.user.id);
        if (!game) return interaction.reply({ content: 'You must start a game before using /move.', ephemeral: true });

        const move = interaction.options.getString('move');
        const result = game.chess.move(move, { sloppy: true });

        if (!result) return interaction.reply({ content: 'That is not a valid move.', ephemeral: true });

        interaction.reply({
            content: 'Move made.',
            ephemeral: true
        });

        const content = await generateContentFromGame(game.chess, interaction.user, game);
        game.interaction.editReply(content);

        if (game.chess.isGameOver()) {
            interaction.channel.send({
                content: `Game over! Congrats ${interaction.user}, you beat the AI!`
            });
            games.delete(interaction.user.id);
        } else {

            const time = Math.random() * 1000 + 500;

            setTimeout(async () => {
                const firstTime = Date.now();
                const aiMove = calculateBestMove(game.chess, 1);
                const timeTaken = Date.now() - firstTime;

                game.computationTimes.push(timeTaken + time);
                game.chess.move(aiMove);
        
                const content2 = await generateContentFromGame(game.chess, interaction.user, game);
                game.interaction.editReply(content2);
        
                if (game.chess.isGameOver()) {
                    interaction.channel.send({
                        content: `Game over! ${interaction.user}, the AI beat you!`
                    });
                    games.delete(interaction.user.id);
                }

            }, time);

        }

    }

    if (interaction.isCommand() && interaction.commandName === 'give-up') {

        const game = games.get(interaction.user.id);
        if (!game) return interaction.reply({ content: 'You must start a game before using /give-up.', ephemeral: true });

        games.delete(interaction.user.id);
        interaction.reply({ content: 'Game cancelled.', ephemeral: true });

    }

});

client.login(process.env.BOT_TOKEN);
