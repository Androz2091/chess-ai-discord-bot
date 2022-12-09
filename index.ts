import { config } from 'dotenv';
config();

import { Client, IntentsBitField } from 'discord.js';

const client = new Client({
    intents: [IntentsBitField.Flags.Guilds]
});

client.on('ready', () => {
    console.log(`🔗 Connecté sur le compte de ${client.user!.tag} !\n`);
});

client.on('interactionCreate', async (interaction) => {

    if (interaction.isCommand() && interaction.commandName === 'chess') {



    }

});

client.login(process.env.BOT_TOKEN);
