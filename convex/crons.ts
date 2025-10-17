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
    { minutes: 30 },
    internal.app.analytics.aggregateCampaignPerformance,
    {}
);

crons.interval(
    "monitorApiPostedVideos",
    { minutes: 60 },
    internal.app.ayrshare.monitorApiPostedVideos,
    {}
);

crons.interval(
    "monitorLatePostedVideos",
    { minutes: 60 },
    internal.app.late.monitorLatePostedVideos,
    {}
);

crons.interval(
    "monitorManuallyPostedVideosFromJson",
    { minutes: 60 },
    internal.app.tiktok.scrapeManuallyPostedVideosFromJson,
    {
        videos: [
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
                "username": "urbantransitvibe",
                "tiktokVideoId": "7560540985252482359"
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
                "username": "underworld.terminal",
                "tiktokVideoId": "7560311389114469646"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "transfertoreality",
                "tiktokVideoId": "7560196182748777741"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "thelensofdreams",
                "tiktokVideoId": "7560507208014843149"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "subwaywithstyle",
                "tiktokVideoId": "7560149588179520823"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "streetsync.cam",
                "tiktokVideoId": "7560311811438824718"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "stillw4tching",
                "tiktokVideoId": "7560311324903738679"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "steelrooms",
                "tiktokVideoId": "7560505961283112205"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "saltandcitrus15",
                "tiktokVideoId": "7560311895928917261"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "quiet_editzz",
                "tiktokVideoId": "7560513658611141902"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "prettycultz",
                "tiktokVideoId": "7560508569368513847"
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
                "username": "nocctv.cam",
                "tiktokVideoId": "7560319909188750647"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "neutral.diary",
                "tiktokVideoId": "7560508320881069367"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "motionzblur",
                "tiktokVideoId": "7560513416985726263"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "mirrorfile",
                "tiktokVideoId": "7560515983991966990"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "memoryloop.x",
                "tiktokVideoId": "7560320068358360375"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "luxereverie.xx",
                "tiktokVideoId": "7560320073366310158"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "linenstudio22",
                "tiktokVideoId": "7560520588805164301"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "grainstations",
                "tiktokVideoId": "7560149807000587534"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "furandfantasyy",
                "tiktokVideoId": "7560165218819575053"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "fisheye.dreams",
                "tiktokVideoId": "7560520558740393271"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "elevator.archive",
                "tiktokVideoId": "7560311880254885133"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "cold.footage",
                "tiktokVideoId": "7560524290303479095"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "coastlight.visuals",
                "tiktokVideoId": "7560525258772499725"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "chromeeditzz",
                "tiktokVideoId": "7560526692360457485"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "champagneafterdark",
                "tiktokVideoId": "7560524704650513678"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "camcordr.exe",
                "tiktokVideoId": "7560312015718206775"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "camcorder12345",
                "tiktokVideoId": "7560319925986839822"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "cam_glow",
                "tiktokVideoId": "7560526540149181710"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "caffeluna01",
                "tiktokVideoId": "7560319945251360055"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "by_habitzz",
                "tiktokVideoId": "7560311624452574478"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "bratzdiaryyy",
                "tiktokVideoId": "7560320166999936269"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "barbiedreams.xx",
                "tiktokVideoId": "7560311742161620238"
            },
            {
                "campaignId": "j97afad8j8kvcdxytw5m3ztb1x7sd7fg",
                "username": "amalfijournal",
                "tiktokVideoId": "7560512716905909517"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "zerogravitystop",
                "tiktokVideoId": "7561598629719444791"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "zerogravitystop",
                "tiktokVideoId": "7561288039251660046"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "zerogravitystop",
                "tiktokVideoId": "7560450557421342007"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "vhsdreams02",
                "tiktokVideoId": "7561646207425088798"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "vhsdreams02",
                "tiktokVideoId": "7561465798435310862"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "vhs.bloom",
                "tiktokVideoId": "7561602389040499982"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "vhs.bloom",
                "tiktokVideoId": "7561452182252424461"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "vhs.bloom",
                "tiktokVideoId": "7560127220824460557"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "vhs_vibess",
                "tiktokVideoId": "7561587284366150943"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "vhs_vibess",
                "tiktokVideoId": "7561220471484648735"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "urbantransitvibe",
                "tiktokVideoId": "7561441350370004237"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "urbanreflect",
                "tiktokVideoId": "7561610990345850142"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "urbanreflect",
                "tiktokVideoId": "7561455136082529567"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "urbanfeedd",
                "tiktokVideoId": "7561489053393210638"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "urbanfeedd",
                "tiktokVideoId": "7560370914550926605"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "unreal_feed",
                "tiktokVideoId": "7561816687696153870"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "unreal_feed",
                "tiktokVideoId": "7561293806922927415"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "underworld.terminal",
                "tiktokVideoId": "7561645275006160159"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "underworld.terminal",
                "tiktokVideoId": "7561319920072543518"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "undergrounds.edit",
                "tiktokVideoId": "7561606031701216543"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "undergrounds.edit",
                "tiktokVideoId": "7561234424315104542"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "undergrounds.edit",
                "tiktokVideoId": "7560382971409190175"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "transfertoreality",
                "tiktokVideoId": "7561586152617135415"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "transfertoreality",
                "tiktokVideoId": "7561444700964539703"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "thelensofdreams",
                "tiktokVideoId": "7561812741091036429"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "thelensofdreams",
                "tiktokVideoId": "7561276741222665527"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "sundaysinitaly",
                "tiktokVideoId": "7561643246603029815"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "sundaysinitaly",
                "tiktokVideoId": "7561257666639564046"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "sundaysinitaly",
                "tiktokVideoId": "7560365345605766455"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "subwaywithstyle",
                "tiktokVideoId": "7561322638186925343"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "subway.feed",
                "tiktokVideoId": "7561620516302474526"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "subway.feed",
                "tiktokVideoId": "7561453829577821471"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "subway.feed",
                "tiktokVideoId": "7560382973267168567"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "subtlemirrors",
                "tiktokVideoId": "7561622242807778591"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "subtlemirrors",
                "tiktokVideoId": "7561290075041008926"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "subtlemirrors",
                "tiktokVideoId": "7560225841834134815"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "streetsync.cam",
                "tiktokVideoId": "7561819518129933582"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "streetsync.cam",
                "tiktokVideoId": "7561482755045887246"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "streetsinmotion.edit",
                "tiktokVideoId": "7561484391315279134"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "streetsinmotion.edit",
                "tiktokVideoId": "7560443862037040397"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "stillw4tching",
                "tiktokVideoId": "7561320080697560334"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "steelrooms",
                "tiktokVideoId": "7561601476292840735"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "steelrooms",
                "tiktokVideoId": "7561230380976721183"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "soft.gold.skin",
                "tiktokVideoId": "7561317347819277571"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "soft.gold.skin",
                "tiktokVideoId": "7560380678022499606"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "silver_frames",
                "tiktokVideoId": "7561629216597495071"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "silver_frames",
                "tiktokVideoId": "7561245525148749087"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "silver_frames",
                "tiktokVideoId": "7560227204764912926"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "seabreeze.edit",
                "tiktokVideoId": "7561649270370077966"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "seabreeze.edit",
                "tiktokVideoId": "7561472169343995150"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "seabreeze.edit",
                "tiktokVideoId": "7560366475458940215"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "saltandcitrus15",
                "tiktokVideoId": "7561628078028377375"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "saltandcitrus15",
                "tiktokVideoId": "7561466901621247263"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "runway_aurelia",
                "tiktokVideoId": "7561315300797369630"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "runway_aurelia",
                "tiktokVideoId": "7560378922077064478"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "retro_lens",
                "tiktokVideoId": "7561604733027257655"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "retro_lens",
                "tiktokVideoId": "7561441433408834830"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "retro_lens",
                "tiktokVideoId": "7560356578516405535"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "reflective.cam",
                "tiktokVideoId": "7561624871302630678"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "reflective.cam",
                "tiktokVideoId": "7561242707734138134"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "reflective.cam",
                "tiktokVideoId": "7560374156475469079"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "recorded.reality",
                "tiktokVideoId": "7561449464800480534"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "recorded.reality",
                "tiktokVideoId": "7560372569858166038"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "quiet_editzz",
                "tiktokVideoId": "7561313924579118350"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "prettycultz",
                "tiktokVideoId": "7561783756277812535"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "prettycultz",
                "tiktokVideoId": "7561475707759594783"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "plasticluvvv",
                "tiktokVideoId": "7561811354558942477"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "plasticluvvv",
                "tiktokVideoId": "7561478874412911927"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "paparazzigram",
                "tiktokVideoId": "7561619166545923358"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "paparazzigram",
                "tiktokVideoId": "7561236544313478414"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "paparazzigram",
                "tiktokVideoId": "7560356516600040718"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "oncam.mov",
                "tiktokVideoId": "7561609049460968718"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "oncam.mov",
                "tiktokVideoId": "7561238379992763661"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "oncam.mov",
                "tiktokVideoId": "7560435269514595597"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "ocean_eyedd",
                "tiktokVideoId": "7561814946422607134"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "ocean_eyedd",
                "tiktokVideoId": "7561481003986849055"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "northbound.soul",
                "tiktokVideoId": "7561594588511669535"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "northbound.soul",
                "tiktokVideoId": "7561251158715567390"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "northbound.soul",
                "tiktokVideoId": "7560382887724469535"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "nocctv.cam",
                "tiktokVideoId": "7561487505636199694"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "neutral.diary",
                "tiktokVideoId": "7561311849984101645"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "mtalines",
                "tiktokVideoId": "7561599699988319519"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "mtalines",
                "tiktokVideoId": "7561452664492412174"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "mtalines",
                "tiktokVideoId": "7560382941008858398"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "motionzblur",
                "tiktokVideoId": "7561485987109424397"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "motionschrome",
                "tiktokVideoId": "7561621252041886990"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "motionschrome",
                "tiktokVideoId": "7561457331427478797"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "motionschrome",
                "tiktokVideoId": "7560226054896454942"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "mirrorfile",
                "tiktokVideoId": "7561597733107207454"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "mirrorfile",
                "tiktokVideoId": "7561458664947748126"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "midnightfeeds",
                "tiktokVideoId": "7561459667340250399"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "midnightfeeds",
                "tiktokVideoId": "7560372444393983263"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "memoryloop.x",
                "tiktokVideoId": "7561592287688510775"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "memoryloop.x",
                "tiktokVideoId": "7561226725766532366"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "marinnford",
                "tiktokVideoId": "7561309467040648470"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "marinnford",
                "tiktokVideoId": "7560489598929915158"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "luxereverie.xx",
                "tiktokVideoId": "7560920788610682125"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "lipglosscore_",
                "tiktokVideoId": "7561812121114234167"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "lipglosscore_",
                "tiktokVideoId": "7561479899635109150"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "lipglosscore_",
                "tiktokVideoId": "7560367932975353118"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "linenstudio22",
                "tiktokVideoId": "7561636747390553375"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "linenstudio22",
                "tiktokVideoId": "7561471401316633886"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "lemontide23",
                "tiktokVideoId": "7561638269914582285"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "lemontide23",
                "tiktokVideoId": "7561448392740687118"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "lemontide23",
                "tiktokVideoId": "7560365091065990413"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "hotgirl.diaries",
                "tiktokVideoId": "7561817781931347214"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "hotgirl.diaries",
                "tiktokVideoId": "7561295138304085303"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "grainstations",
                "tiktokVideoId": "7561266962538515725"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "glitchclub.cam",
                "tiktokVideoId": "7561304534987885879"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "glitchclub.cam",
                "tiktokVideoId": "7560375858989436191"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "glam.cores",
                "tiktokVideoId": "7561815739502497079"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "glam.cores",
                "tiktokVideoId": "7561481864272284959"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "glam.cores",
                "tiktokVideoId": "7560369383009226039"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "furandfantasyy",
                "tiktokVideoId": "7561773110299610398"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "furandfantasyy",
                "tiktokVideoId": "7561266150324178206"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "footagezones",
                "tiktokVideoId": "7561301913262689550"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "footagezones",
                "tiktokVideoId": "7560372347195116813"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "focusfeed.edit",
                "tiktokVideoId": "7561296471954427191"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "focusfeed.edit",
                "tiktokVideoId": "7560375781298359582"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "floor_eleven",
                "tiktokVideoId": "7561626493483355423"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "floor_eleven",
                "tiktokVideoId": "7561291810526596382"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "floor_eleven",
                "tiktokVideoId": "7560374130357439774"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "fishviewworld",
                "tiktokVideoId": "7561486724400942349"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "fishviewworld",
                "tiktokVideoId": "7560378721807404318"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "fisheye.dreams",
                "tiktokVideoId": "7561810618748062990"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "fisheye.dreams",
                "tiktokVideoId": "7561274807195585823"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "film.core7",
                "tiktokVideoId": "7561298082562837773"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "film.core7",
                "tiktokVideoId": "7560375760859516173"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "elevator.archive",
                "tiktokVideoId": "7561617752729963807"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "elevator.archive",
                "tiktokVideoId": "7561452868541107487"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "dolcevibesss",
                "tiktokVideoId": "7561786674913594654"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "dolcevibesss",
                "tiktokVideoId": "7561473601539476766"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "dolcevibesss",
                "tiktokVideoId": "7560367834098978079"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "cold.footage",
                "tiktokVideoId": "7561485176010706231"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "coastlight.visuals",
                "tiktokVideoId": "7561624070513626398"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "coastlight.visuals",
                "tiktokVideoId": "7561463582198746398"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "chromeeditzz",
                "tiktokVideoId": "7561603584316509471"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "chromeeditzz",
                "tiktokVideoId": "7561232777895480607"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "champagneafterdark",
                "tiktokVideoId": "7561282950344510750"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "cashmere.complexion",
                "tiktokVideoId": "7561279690032418079"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "cashmere.complexion",
                "tiktokVideoId": "7560380597504462135"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "camloopz",
                "tiktokVideoId": "7561488328785251597"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "camloopz",
                "tiktokVideoId": "7560370997740801294"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "camcordr.exe",
                "tiktokVideoId": "7561593768357514526"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "camcordr.exe",
                "tiktokVideoId": "7561450544527723806"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "camcorder12345",
                "tiktokVideoId": "7561596821030604045"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "camcorder12345",
                "tiktokVideoId": "7561286359105703223"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "cam_glow",
                "tiktokVideoId": "7561590893204016398"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "cam_glow",
                "tiktokVideoId": "7561225376995888439"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "calm_studio1",
                "tiktokVideoId": "7561449354167389454"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "calm_studio1",
                "tiktokVideoId": "7560378713725062414"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "caffeluna01",
                "tiktokVideoId": "7561630697576746295"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "caffeluna01",
                "tiktokVideoId": "7561247121744071967"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "by.thecoast",
                "tiktokVideoId": "7561474459404733727"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "by.thecoast",
                "tiktokVideoId": "7560367857662577951"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "by_habitzz",
                "tiktokVideoId": "7561469211483196727"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "bratzdiaryyy",
                "tiktokVideoId": "7561780223344200991"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "bratzdiaryyy",
                "tiktokVideoId": "7561478027255876878"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "bimbovision",
                "tiktokVideoId": "7561820490101263629"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "bimbovision",
                "tiktokVideoId": "7561483651549056287"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "bimbovision",
                "tiktokVideoId": "7560370884184198431"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "barbiedreams.xx",
                "tiktokVideoId": "7561777817231428894"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "barbiedreams.xx",
                "tiktokVideoId": "7561270710392409375"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "barbie.files",
                "tiktokVideoId": "7561813830083431693"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "barbie.files",
                "tiktokVideoId": "7561281012559383821"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "barbie.files",
                "tiktokVideoId": "7560369742792363294"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "amalfijournal",
                "tiktokVideoId": "7561615404209048862"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "amalfijournal",
                "tiktokVideoId": "7561240964703030559"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "2k__cam",
                "tiktokVideoId": "7561612550819941645"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "2k__cam",
                "tiktokVideoId": "7561464249109712183"
            },
            {
                "campaignId": "j978nsz24t0wzg3d77ccqkbxqn7sd7qx",
                "username": "2k__cam",
                "tiktokVideoId": "7560437174269709582"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "themovingsteps",
                "tiktokVideoId": "7561774631795854623"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "themovingsteps",
                "tiktokVideoId": "7561444031163632927"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "thelazystairs",
                "tiktokVideoId": "7561779874201914637"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "thelazystairs",
                "tiktokVideoId": "7561268882015571230"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "sundaysinitaly",
                "tiktokVideoId": "7560919861438762254"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "streetmotions",
                "tiktokVideoId": "7561448248066460941"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "streetmotions",
                "tiktokVideoId": "7560930218005810445"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "stepbystep.xx",
                "tiktokVideoId": "7561778998326365471"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "stepbystep.xx",
                "tiktokVideoId": "7561476903320685879"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "steelvisions",
                "tiktokVideoId": "7561640891895663894"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "steelvisions",
                "tiktokVideoId": "7561443068042284310"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "steelvisions",
                "tiktokVideoId": "7561073873077292310"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "stairsarejealous",
                "tiktokVideoId": "7561781399322184991"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "stairsarejealous",
                "tiktokVideoId": "7561273005968575774"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "sideview.mp4",
                "tiktokVideoId": "7561584704223202574"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "sideview.mp4",
                "tiktokVideoId": "7561222294111014157"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "sideview.mp4",
                "tiktokVideoId": "7560884598285061390"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "seabreeze.edit",
                "tiktokVideoId": "7560903789927042318"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "rhythmofmotion",
                "tiktokVideoId": "7561595581290794253"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "rhythmofmotion",
                "tiktokVideoId": "7561460479802101006"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "rhythmofmotion",
                "tiktokVideoId": "7561103871855037751"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "pedestrianedit",
                "tiktokVideoId": "7561438317925977375"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "pedestrianedit",
                "tiktokVideoId": "7561079787196812574"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "paparazzigram",
                "tiktokVideoId": "7560894007128198414"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "offguardview",
                "tiktokVideoId": "7561588441851464973"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "offguardview",
                "tiktokVideoId": "7561470277826235661"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "offguardview",
                "tiktokVideoId": "7561069065775664439"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "motionsfeed",
                "tiktokVideoId": "7561647883569630477"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "motionsfeed",
                "tiktokVideoId": "7561255661502319885"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "motionsfeed",
                "tiktokVideoId": "7561071026231053581"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "milkstate",
                "tiktokVideoId": "7561248881946774814"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "mallarchives",
                "tiktokVideoId": "7561639084544871694"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "mallarchives",
                "tiktokVideoId": "7561253559161916702"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "lemontide23",
                "tiktokVideoId": "7560897653941226765"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "glideframes",
                "tiktokVideoId": "7561631544683580686"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "glideframes",
                "tiktokVideoId": "7561468120225942839"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "escalator_vibes",
                "tiktokVideoId": "7561263608454319391"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "dolcevibesss",
                "tiktokVideoId": "7560909716352814366"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "d4ilystride",
                "tiktokVideoId": "7561291758328466743"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "d4ilystride",
                "tiktokVideoId": "7561099834862603534"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "crosswalk.cam",
                "tiktokVideoId": "7561288033996229943"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "crosswalk.cam",
                "tiktokVideoId": "7560934623463738637"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "concretestreets",
                "tiktokVideoId": "7561589832657505550"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "concretestreets",
                "tiktokVideoId": "7561445458632101175"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "concretestreets",
                "tiktokVideoId": "7561084965006462221"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "citystepz",
                "tiktokVideoId": "7561403104361565470"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "citystepz",
                "tiktokVideoId": "7560935299967192375"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "cityframee",
                "tiktokVideoId": "7561439535926758678"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "chromeangle",
                "tiktokVideoId": "7561260341884144926"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "chromeangle",
                "tiktokVideoId": "7561095433863433503"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "by.thecoast",
                "tiktokVideoId": "7560914886855773495"
            },
            {
                "campaignId": "j97fydwhzshbck11tmq7qpwpd97sct6q",
                "username": "beigefeed",
                "tiktokVideoId": "7561250466332429598"
            }
        ]

    }
)

export default crons;