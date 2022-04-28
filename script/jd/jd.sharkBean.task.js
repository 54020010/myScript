/**
 * 京东新版摇京豆（2021/03/02~2023/12/31）
 * 1. “京东首页→我的（京东右下方）→京享值xxx（头部左上方）→点击页面中的【摇京豆】”，进入摇京豆游戏页面参与活动。
 * 2. “京东首页→领京豆→点击页面中的【摇京豆】”，进入摇京豆游戏页面参与活动。
 */
const $ = Env('京东新版摇京豆');

let _log = [];
let _beans = 0;
let _desc = [];

function getOption(cookie, appid, functionId, body) {
  const option = {
    url: `https://api.m.jd.com/?t=${ts()}&appid=${appid}&functionId=${functionId}&body=${encodeURIComponent(
      JSON.stringify(body)
    )}`,
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'zh-cn',
      Connection: 'keep-alive',
      Host: 'api.m.jd.com',
      Cookie:
        '__jdv=122270672|direct|-|none|-|1651125433699; __jda=122270672.1651125433698521862329.1651125433.1651125433.1651125433.1; mba_muid=1651125433698521862329; __jdc=122270672; shshshfp=f8eb9e273379cd56b43f30981db7e501; shshshfpa=7a23fecf-7bfa-8ec7-e17e-64c3e979ee29-1651125434; shshshsID=733943647b008918171d90cff654fa00_1_1651125434071; shshshfpb=oJ0e6oWdxBhczl7fTB7TEMg; 3AB9D23F7A4B3C9B=NNZNOB5J4GHEDMXZMAUODEEXMTGS5OX27LKM7UDHQWQMM6Y7VFBZCQ7HT7E5HSP3SV7RKXJE3HADLNTSVLDUF5QDKA; jcap_dvzw_fp=uiyaq4UfFGtILARwtLYqaiV_G9dmQPErJlryZGjKr046JqJ_g7dVJucfmvJkQiVNNDZ2YA==; TrackerID=Sc3X45k-la6uej5syspPxvIdj3RSZ9OsjMhKlN9IfWkMAZ2zCo8qFoj1bAmg9wmZoPGSSSIVo0q9QCT1F8PpYiRqj_JQzigbGT2iX3FKwfo_gjwdn_NPeAL9vHvE4btvLkc-QTeSKZKf82AjpsS70A; pt_key=AAJiaizdADCcteOCRah6lk30449mAPHTWR8Axx1yq0UYztmOaYWH3O1mBfnGni84Oh-8CMmMqmw; pt_pin=jd_640b6c4e6532b; pt_token=6rhfd1zy; pwdt_id=jd_640b6c4e6532b; sfstoken=tk01m00921e47a8sMSsxeDMrMSsxqK+SWAyy+mJvvXNVioDXnutjQlizgzQ8CAahHeEJ8xsny0Ob1XEOIpjrnnS0nlvm; whwswswws=; wxa_level=1; retina=1; cid=9; wqmnx1=MDEyNjM2MXQvY01hKHcxVyBBZTUgTGVvbzA5IGkzLy41M2ZmMjVWRUlVKFI=; jxsid=16511254684032826970; appCode=ms0ca95114; webp=1; __jdb=122270672.2.1651125433698521862329|1.1651125433; mba_sid=16511254337008458246554186328.2; visitkey=7102386444594908; autoOpenApp_downCloseDate_jd_homePage=1651125468910_1; __jd_ref_cls=MCommonBottom_My',
      Origin: 'https://spa.jd.com',
      Referer: 'https://spa.jd.com/home',
      'User-Agent':
        'jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
    },
  };
  return option;
}

function indexPage(cookie) {
  let eventName = '【获取摇京豆首页】';
  const body = { paramData: { token: 'dd2fb032-9fa3-493b-8cd0-0d57cd51812d' } };
  option = getOption(cookie, 'sharkBean', 'pg_channel_page_data', body);

  return new Promise((resolve, reject) => {
    $.get(option, (err, resp, data) => {
      try {
        if (resp.statusCode === 200 && JSON.parse(data).data) {
          const _data = JSON.parse(data).data;
          const signInfo = _data.floorInfoList.filter((item) => !!item && item.code === 'SIGN_ACT_INFO')[0];
          const singToken = signInfo.token;
          const currSignCursor = signInfo.floorData.signActInfo.currSignCursor;
          const signStatus = signInfo.floorData.signActInfo.signActCycles.filter(
            (item) => !!item && item.signCursor === currSignCursor
          )[0].signStatus;
          _log.push(`🟢${eventName}`);
          resolve([signStatus, singToken, currSignCursor]);
        } else {
          throw err || data;
        }
      } catch (e) {
        _log.push(`🔴${eventName}: ${err}`);
        _desc.push(`🔴${eventName}`);
      }
    });
  });
}

async function checkIn(cookie) {
  let eventName = '【签到】';
  const [signStatus, singToken, currSignCursor] = await indexPage(cookie);

  if (signStatus === '-1') {
    // 未签到
    const body = { floorToken: singToken, dataSourceCode: 'signIn', argMap: { currSignCursor: currSignCursor } };
    await _checkIn(getOption(cookie, 'sharkBean', 'pg_interact_interface_invoke', body));
  } else {
    _log.push(`🟡${eventName}: 第${currSignCursor}天已签到`);
  }
}

function _checkIn(option) {
  let eventName = '【签到】';

  return new Promise((resolve, reject) => {
    $.post(option, (err, resp, data) => {
      try {
        if (resp.statusCode === 200 && data) {
          console.log(data);
          _log.push(`🟢${eventName}`);
          _desc.push(`🟢${eventName}`);
        } else {
          throw err || data;
        }
      } catch (error) {
        _log.push(`🔴${eventName}: ${error}`);
        _desc.push(`🔴${eventName}`);
        resolve();
      }
    });
  });
}

!(async () => {
  const JD_COOKIE = $.getdata('GLOBAL_JD_COOKIE');

  if (JD_COOKIE) {
    await checkIn(JD_COOKIE);
  } else {
    $.subt = '🔴 请先获取会话';
    _log.push($.subt);
  }

  $.log(..._log);
  $.desc = _desc.join('');
  $.msg($.name, $.subt, $.desc);
})()
  .catch((e) => {
    $.logErr(e);
  })
  .finally(() => {
    $.done();
  });

function ts() {
  // 获取时间戳
  return new Date().getTime();
}

// prettier-ignore
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } isShadowrocket() { return "undefined" != typeof $rocket } isStash() { return "undefined" != typeof $environment && $environment["stash-version"] } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { if (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: i, statusCode: r, headers: o, rawBody: h } = t; e(null, { status: i, statusCode: r, headers: o, rawBody: h }, s.decode(h, this.encoding)) }, t => { const { message: i, response: r } = t; e(i, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { let i = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...o } = t; this.got[s](r, o).then(t => { const { statusCode: s, statusCode: r, headers: o, rawBody: h } = t; e(null, { status: s, statusCode: r, headers: o, rawBody: h }, i.decode(h, this.encoding)) }, t => { const { message: s, response: r } = t; e(s, r, r && i.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, i = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": i } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
