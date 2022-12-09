import { config } from 'dotenv';
config();

import { Client, IntentsBitField } from 'discord.js';

const client = new Client({
    intents: [IntentsBitField.Flags.Guilds]
});

client.on('ready', () => {
    console.log(`🔗 Logged in as ${client.user!.tag}`);
});

client.on('interactionCreate', async (interaction) => {

    if (interaction.isCommand() && interaction.commandName === 'chess') {



    }

});

client.login(process.env.BOT_TOKEN);
