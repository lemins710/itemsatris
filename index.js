const { Client, Intents, MessageEmbed } = require('discord.js');
const { MessageButton, MessageActionRow } = require('discord-buttons');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const { readFileSync } = require('fs');

require('discord-buttons')(client);

// sifreler.json dosyasını okuyun
const sifreler = JSON.parse(readFileSync('./sifreler.json', 'utf-8'));
const sifrelerSet1 = sifreler.sifrelerSet1;
const sifrelerSet2 = sifreler.sifrelerSet2;

// Rol ID'leri
const rol_id1 = '1251507202834038874'; // Sifreler1 doğruysa verilecek rol ID
const rol_id2 = '1251507516668645477'; // Sifreler2 doğruysa verilecek rol ID

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
    if (message.content === '!gonder') {
        // Embed mesajı oluşturun
        const embed = new MessageEmbed()
            .setTitle('Ürün Kodu Doğrulama')
            .setDescription('Merhabalar! Eğer bir ürün aldıysanız, aldığınız kodu lütfen aşağıdaki alana yazınız.');

        // Düğmeyi oluşturun
        const button = new MessageButton()
            .setLabel('Kod Girişi')
            .setStyle('blurple')
            .setID('kod_girisi');

        // Mesajı gönderin
        const sentMessage = await message.channel.send({ embed: embed, components: [new MessageActionRow().addComponent(button)] });

        // Düğme tıklama işlemini dinleyin
        client.on('clickButton', async (button) => {
            if (button.id === 'kod_girisi' && button.message.id === sentMessage.id) {
                const user = button.clicker.user;

                // Kullanıcıya DM olarak mesaj gönderin
                await user.send("Lütfen kodunuzu buraya yazın.");

                // Kullanıcının mesajını bekleyin
                const dmFilter = dm => dm.author.id === user.id;
                const collectedDMs = await user.dmChannel.awaitMessages({ filter: dmFilter, max: 1, time: 60000, errors: ['time'] });

                const kod = collectedDMs.first().content.trim();

                // Doğrulama işlemi
                if (sifrelerSet1.includes(kod)) {
                    const role = button.guild.roles.cache.get(rol_id1);
                    if (role) {
                        await button.clicker.member.roles.add(role);
                        await button.reply.send(`${button.clicker.user.username}, doğru şifreyi girdiniz! ${role.name} rolü verildi.`, true);
                    }
                } else if (sifrelerSet2.includes(kod)) {
                    const role = button.guild.roles.cache.get(rol_id2);
                    if (role) {
                        await button.clicker.member.roles.add(role);
                        await button.reply.send(`${button.clicker.user.username}, doğru şifreyi girdiniz! ${role.name} rolü verildi.`, true);
                    }
                } else {
                    await button.reply.send("Yanlış kod girdiniz!", true);
                }
            }
        });
    }
});

// Botu başlatın
client.login('TOKEN'); // Burada TOKEN yerine kendi bot tokeninizi yazmalısınız
