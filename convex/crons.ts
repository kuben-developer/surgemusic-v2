import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// crons.interval(
//     "monitorManuallyPostedVideos",
//     { minutes: 15 },
//     internal.app.tiktok.monitorManuallyPostedVideos,
// );

crons.interval(
    "aggregateCampaignPerformance",
    { minutes: 15 },
    internal.app.analytics.aggregateCampaignPerformance,
    {}
);

crons.interval(
    "monitorApiPostedVideos",
    { minutes: 30 },
    internal.app.ayrshare.monitorApiPostedVideos,
    {}
);

crons.interval(
    "monitorLatePostedVideos",
    { minutes: 30 },
    internal.app.late.monitorLatePostedVideos,
    {}
);

crons.interval(
    "monitorManuallyPostedVideosFromJson",
    { minutes: 30 },
    internal.app.tiktok.scrapeManuallyPostedVideosFromJson,
    {
        videos: [
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "grainstations",
                "tiktokVideoId": "7560149807000587534"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "subwaywithstyle",
                "tiktokVideoId": "7560149588179520823"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "furandfantasyy",
                "tiktokVideoId": "7560165218819575053"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "camcordr.exe",
                "tiktokVideoId": "7560312015718206775"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "saltandcitrus15",
                "tiktokVideoId": "7560311895928917261"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "barbiedreams.xx",
                "tiktokVideoId": "7560311742161620238"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "stillw4tching",
                "tiktokVideoId": "7560311324903738679"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "elevator.archive",
                "tiktokVideoId": "7560311880254885133"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "streetsync.cam",
                "tiktokVideoId": "7560311811438824718"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "by_habitzz",
                "tiktokVideoId": "7560311624452574478"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "underworld.terminal",
                "tiktokVideoId": "7560311389114469646"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "camcorder12345",
                "tiktokVideoId": "7560319925986839822"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "caffeluna01",
                "tiktokVideoId": "7560319945251360055"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "bratzdiaryyy",
                "tiktokVideoId": "7560320166999936269"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "nocctv.cam",
                "tiktokVideoId": "7560319909188750647"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "urbanreflect",
                "tiktokVideoId": "7560319906412104974"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "unreal_feed",
                "tiktokVideoId": "7560319843669478670"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "luxereverie.xx",
                "tiktokVideoId": "7560320073366310158"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "memoryloop.x",
                "tiktokVideoId": "7560320068358360375"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "steelrooms",
                "tiktokVideoId": "7560505961283112205"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "thelensofdreams",
                "tiktokVideoId": "7560507208014843149"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "neutral.diary",
                "tiktokVideoId": "7560508320881069367"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "prettycultz",
                "tiktokVideoId": "7560508569368513847"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "vhsdreams02",
                "tiktokVideoId": "7560509057539378487"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "vhs_vibess",
                "tiktokVideoId": "7560510043184008503"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "plasticluvvv",
                "tiktokVideoId": "7560510808304782605"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "ocean_eyedd",
                "tiktokVideoId": "7560510927397784846"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "amalfijournal",
                "tiktokVideoId": "7560512716905909517"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "motionzblur",
                "tiktokVideoId": "7560513416985726263"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "quiet_editzz",
                "tiktokVideoId": "7560513658611141902"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "mirrorfile",
                "tiktokVideoId": "7560515983991966990"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "linenstudio22",
                "tiktokVideoId": "7560520588805164301"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "fisheye.dreams",
                "tiktokVideoId": "7560520558740393271"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "cold.footage",
                "tiktokVideoId": "7560524290303479095"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "champagneafterdark",
                "tiktokVideoId": "7560524704650513678"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "coastlight.visuals",
                "tiktokVideoId": "7560525258772499725"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "cam_glow",
                "tiktokVideoId": "7560526540149181710"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "chromeeditzz",
                "tiktokVideoId": "7560526692360457485"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "transfertoreality",
                "tiktokVideoId": "7560196182748777741"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "urbantransitvibe",
                "tiktokVideoId": "7560540985252482359"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "vhs.bloom",
                "tiktokVideoId": "7560127220824460557"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "retro_lens12",
                "tiktokVideoId": "7560356578516405535"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "seabreeze.edit",
                "tiktokVideoId": "7560366475458940215"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "streetsinmotion.edit",
                "tiktokVideoId": "7560443862037040397"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "lemontide23",
                "tiktokVideoId": "7560365091065990413"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "marinnford",
                "tiktokVideoId": "7560489598929915158"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "paparazzigram",
                "tiktokVideoId": "7560356516600040718"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "silver_frames",
                "tiktokVideoId": "7560227204764912926"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "mtalines",
                "tiktokVideoId": "7560382941008858398"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "floor_eleven",
                "tiktokVideoId": "7560374130357439774"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "soft.gold.skin",
                "tiktokVideoId": "7560380678022499606"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "undergrounds.edit",
                "tiktokVideoId": "7560382971409190175"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "camloopz",
                "tiktokVideoId": "7560370997740801294"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "midnightfeeds",
                "tiktokVideoId": "7560372444393983263"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "runway_aurelia",
                "tiktokVideoId": "7560378922077064478"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "urbanfeedd",
                "tiktokVideoId": "7560370914550926605"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "calm_studio1",
                "tiktokVideoId": "7560378713725062414"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "zerogravitystop",
                "tiktokVideoId": "7560450557421342007"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "cashmere.complexion",
                "tiktokVideoId": "7560380597504462135"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "subtlemirrors",
                "tiktokVideoId": "7560225841834134815"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "lipglosscore_",
                "tiktokVideoId": "7560367932975353118"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "fishviewworld",
                "tiktokVideoId": "7560378721807404318"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "glam.cores",
                "tiktokVideoId": "7560369383009226039"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "reflective.cam",
                "tiktokVideoId": "7560374156475469079"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "sundaysinitaly",
                "tiktokVideoId": "7560365345605766455"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "focusfeed.edit",
                "tiktokVideoId": "7560375781298359582"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "footagezones",
                "tiktokVideoId": "7560372347195116813"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "by.thecoast",
                "tiktokVideoId": "7560367857662577951"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "oncam.mov",
                "tiktokVideoId": "7560435269514595597"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "2k__cam",
                "tiktokVideoId": "7560437174269709582"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "film.core7",
                "tiktokVideoId": "7560375760859516173"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "dolcevibesss",
                "tiktokVideoId": "7560367834098978079"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "northbound.soul",
                "tiktokVideoId": "7560382887724469535"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "bimbovision",
                "tiktokVideoId": "7560370884184198431"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "recorded.reality",
                "tiktokVideoId": "7560372569858166038"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "motionschrome",
                "tiktokVideoId": "7560226054896454942"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "glitchclub.cam",
                "tiktokVideoId": "7560375858989436191"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "subway.feed",
                "tiktokVideoId": "7560382973267168567"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "barbie.files",
                "tiktokVideoId": "7560369742792363294"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "rhythmofmotion",
                "tiktokVideoId": ""
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "milkstate",
                "tiktokVideoId": ""
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "by.thecoast",
                "tiktokVideoId": "7560914886855773495"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "beigefeed",
                "tiktokVideoId": ""
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "d4ilystride",
                "tiktokVideoId": ""
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "paparazzigram",
                "tiktokVideoId": "7560894007128198414"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "dolcevibesss",
                "tiktokVideoId": "7560909716352814366"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "sundaysinitaly",
                "tiktokVideoId": "7560919861438762254"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "lemontide23",
                "tiktokVideoId": "7560897653941226765"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "seabreeze.edit",
                "tiktokVideoId": "7560903789927042318"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "motionsfeed",
                "tiktokVideoId": ""
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "pedestrianedit",
                "tiktokVideoId": ""
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "offguardview",
                "tiktokVideoId": ""
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "concretestreets",
                "tiktokVideoId": ""
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "citystepz",
                "tiktokVideoId": "7560935299967192375"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "chromeangle",
                "tiktokVideoId": ""
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "sideview.mp4",
                "tiktokVideoId": "7560884598285061390"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "steelvisions",
                "tiktokVideoId": ""
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "streetmotions",
                "tiktokVideoId": "7560930218005810445"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "crosswalk.cam",
                "tiktokVideoId": "7560934623463738637"
            }
        ]

    }
)

export default crons;