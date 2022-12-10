const { config } = require('dotenv');
config();

const { REST } = require('@discordjs/rest');
const { Routes, ApplicationCommandOptionType } = require('discord-api-types/v9');

const commands = [
    {
        name: 'chess',
        description: 'Play a game of chess against the AI'
    },
    {
        name: 'move',
        description: 'Make a move in your chess game',
        options: [
            {
                name: 'move',
                description: 'The move to make',
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true
            }
        ]
    }
];

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {

        const { id: userId, username } = await rest.get(
            Routes.user()
        );

        console.log(`👋 Connected as ${username}!`);

        const [ { id: guildId, name: guildName } ] = await rest.get(
            Routes.userGuilds()
        );

        console.log(`💻 Connected to ${guildName}!`);

        await rest.put(
            Routes.applicationGuildCommands(userId, guildId),
            { body: commands }
        ).then(console.log);

        console.log(`💻 Commands have been registered on ${guildName}!`);
    } catch (error) {
        console.error(error);
    }
})();
