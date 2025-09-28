export default class AvonConfig extends Object {
  token: string;
  prefix: string;
  nodes: object[];
  spotiId: string;
  owners: string[];
  spotiSecret: string;
  spotiNodes: object[];
  webhooks: object;
  supportId: string;
  color: string;
  server: string;
  voteUrl: string;
  voteApi: string;
  setupBgLink: string;
  constructor() {
    super();
    this.token =
      "Dc4MjQyNDY3OTQw.GoFMX3.d6VUezrRLh5MNWTOqMXksd0pPAjgqDEXq29n4M";
    this.prefix = "?";
    this.nodes = [
      {
        name: `Avon`,
        url: `lavalink.jirayu.net:13592`,
        auth: `youshallnotpass`,
        secure: false,
      },
    ];
    this.voteApi =
      "";
    this.webhooks = {
      guildCreate:
        "https://discord.com/api/webhooks/1421027928413569045/dUCT-WlgjIsmpxX61ldbisWBDoK7OBuLy5p4Mni3Scjc6me3c-oGlv8G-tGmBSyqTkdZ",
      guildDelete:
        "https://discord.com/api/webhooks/1421027928413569045/dUCT-WlgjIsmpxX61ldbisWBDoK7OBuLy5p4Mni3Scjc6me3c-oGlv8G-tGmBSyqTkdZ",
      Cmds: "https://discord.com/api/webhooks/1421754606031212585/d-b1iMnDT5xBvpsQQR34KwNK1z-D-SaQJASBIJnuZNjCxxkXHjUR-Cw40zCxyYFocttx",
    };
    this.server = "https://discord.gg/avonbot";
    this.spotiId = "579e0d88e03dad18a3fbd1a8f20a";
    this.spotiSecret = "87fdc8984880bd0efb41516a92ef";
    this.owners = ["973925530153910322"];
    this.color = "#ff0000";
    this.supportId = "973925530153910322";
    this.spotiNodes = [
      {
        id: `Avon`,
        host: `lavalink.jirayu.net`,
        port: 13592,
        password: `youshallnotpass`,
        secure: false,
      },
    ];
    this.voteUrl = "https://top.gg/bot/904317141866647592/vote";
    this.setupBgLink =
      "";
  }
}
