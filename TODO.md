# TODO: Update Discord.js v14 Deprecations and API Changes

## 1. Discord.js v14 Deprecations (.tag to .username)
- [x] typings/src/events/MessageCreate.ts: Replace message.author.tag with message.author.username (if any) - No instances found
- [x] typings/src/events/InteractionCreate.ts: Replace ~10 interaction.user.tag with interaction.user.username
- [x] typings/src/events/GuildCreate.ts: Replace guild.members.cache.get(guild.ownerId).user.tag with .username - Already using .username
- [x] typings/src/events/Afk.ts: Replace mention?.tag and mentionMember?.user.tag with .username
- [x] typings/src/commands/Utility/Help.ts: Already using .username
- [x] typings/src/commands/Utility/Profile.ts: Replace message.author.tag with .username
- [x] typings/src/commands/Utility/Premium.ts: Replace message.author.tag and user.tag with .username
- [x] typings/src/commands/Utility/Ignore.ts: Replace message.author.tag with .username
- [x] typings/src/commands/Utility/Avatar.ts: Replace mem.user.tag, user.tag, message.author.tag with .username
- [x] typings/src/commands/Utility/Afk.ts: Replace message.author.tag with .username
- [x] typings/src/commands/Rihan/Rihan.ts: Replace user.tag and us.tag with .username
- [x] typings/src/commands/Rihan/Dm.ts: Replace user.tag with .username
- [x] typings/src/commands/Music/Queue.ts: Replace message.author.tag with .username
- [x] typings/src/commands/Information/Stats.ts: Replace this.client.user.tag with .username
- [x] typings/src/commands/Developer/UpdatePremium.ts: Replace message.author.tag with .username
- [x] typings/src/commands/Developer/RemovePremium.ts: Replace user.tag with .username
- [x] typings/src/commands/Developer/Noprefix.ts: Replace message.author.tag with .username
- [x] typings/src/base/AvonPlayer.ts: Replace track.info.requester.tag with .username

## 2. Kazagumo/Shoukaku API Changes
- [x] typings/src/api/Dispatcher.ts: Change this.player.player.on to this.player.on (lines ~10,20,30), change { resolve: true } to { noReplace: false } (lines ~15,25)
- [x] typings/src/commands/Music/Play.ts: Replace Shoukaku search with Kazagumo, add null checks

## 3. Null Safety Checks
- [x] typings/src/commands/Music/Play.ts: Add if (track.info) before assigning requester

## 4. API Adjustments
- [x] typings/src/api/Api.ts: Change player to player.player (lines ~20,45)

## Followup
- [ ] Run npx tsc to compile
- [ ] Test the bot
