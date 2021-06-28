// @ts-nocheck
const vscode = acquireVsCodeApi();
const callbacks = {};
/**
 * 调用vscode原生api
 * @param data 可以是类似 {cmd: 'xxx', param1: 'xxx'}，也可以直接是 cmd 字符串
 * @param cb 可选的回调函数
 */
function callVscode(data, cb) {
  if (typeof data === 'string') {
    data = { cmd: data };
  }
  if (cb) {
    // 时间戳加上5位随机数
    const cbid = Date.now() + '' + Math.round(Math.random() * 100000);
    callbacks[cbid] = cb;
    data.cbid = cbid;
  }
  vscode.postMessage(data);
}
/**
 *
 * @returns
 */
function uuid(len, radix) {
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  let uuid = [],
    i;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    // rfc4122, version 4 form
    let r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join('');
}
const imgBase = {
  code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAilBMVEX///8AAAD///8/LC0/MTBALS5aNTTp7e3p7e0+NDQ+NDRJQEBJQEA/NDQ/NDQ+NDTp7Ozp7Ow+NDQ+NDTp7e3////19fXp7e3s6+vp4+Lh4eHp2dfX1tbMy8vBv7+2s7Oqp6edmpqQjIyCfn50bm5kXV1SSkpSPj1JPz9ANjY/NTVLLy8+NDRDLy8c6RKnAAAAFXRSTlMAAAMRGBkagIugpK+wsrPj5+jo6/wnIWgmAAABo0lEQVR42u3X21LCMBAGYOpZUVFwezItLQmV1t/3fz1ne7InmlBu1Glu+GG63zS7KQOLxX9alnX74hxfS6uxhoE7Z2xhqQVexwE86gBHAzSEicCPMBWohclAJUwHSuEMoBCmAF9NYQpwQEOYAniHxj0MAheO6XqbgRkwBrw0rWL24Z0OeCmyKn8i9U4FuL4ues/aggHQqnccry3ogU59V9ACvfqOoAWyXn0hnACkfaAxFf0W+kJrVwZN7ArtrpiMsS10ump0kJpCdypmR7nR9e5UDB+mrO56lnnzN9IM/B0AJ6wxQMmkCnICoFwi2lbBjgEQh0ABEByjUSCxXYWIYijbl9gHtAPIlzJ2STIgpdyPAlwLbCVCyi90XYBEITOg3UJAZQNsP3/ZkioAhKRMgPqSogoRyTJyyntwHiDLyRwF+JaBXQK/2AuDBeDbRj2QFAB7O0Scj0tRWAIRv9cA66JXQeTaCQcRheQnANlCuCxBkBCCD8l6EHjI7TgQ26QMQcQp4qXyjzjxnO8HgZuV6ZOwuhz+uX/9tDEp3zxfWb/pH/c3GtAJxR7lzkIAAAAASUVORK5CYII=',
  css: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAk1BMVEUAAAD///9Lw/BKv+pHwutFxOvp7e3p7e1Lv+pLv+uS0+yS1OxKv+tKv+tKv+vp7Ozp7OxLvupLv+rp7e3p7e3f6u3e6u3V5+3U5+3M5O3L5OzB4ey43uy33uyu3O2t3O2k2eyj2eya1uyZ1uyQ0+yP0+yG0Ot7zuxzy+xyyuxoyOtox+tfxetexOtVwutUwetLv+sZIO3RAAAAFHRSTlMAAxEYGRqAi6Ckr7Cys+Pn6Ojr/BXcmpUAAAF1SURBVHja7dfbUsIwEAZgPJ9R8GcbBFGqtFBK+7//03lBWsrBbKKjIw57tZlJvnabTWbaav2vOL/H53Gtr7+AK6gLD26ANxoABVAFFdAEHVAED8At+ABOwQtwCW6g1AU3MKEquAGZaO9wBN94PAB+gCT5tMoXeSKhgBTkvBrMyUICgYQzsxqZGZNAYEHTHBrmgQC5eZR+GRCWm4CEAJIwXQdSNnZSBeZkKeuAKcksBCjMBtDsC70Ek36vBEC2d0H2rA+2W3kRCKScNoqWafBhkpKs74PZRl94XSgmLVf3QZnK4VY+AHsDMCB+FsheDDAgGRtgmY0NADz7Ae8AgD4Zo8rGy2zgBWRAnJMkI2R2eq/OPIAhYjvpi0CE3E6KAcC80pZg3kIBjiMAiNeykBLsJ5E6M74f8S1vAqizngJ0mtv4RA6XmzciB3Vmo7MTuKoeNYqAvl3WGxVkv85sXO4Eztq+jdw+3n2aTm+7Psu7dyd/6n/7A0etAdmQymRXAAAAAElFTkSuQmCC',
  js: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAkFBMVEUAAAD///8etKUgtZ8fuKMdsZ3p7e3p7e0ls54ks519zMB+zMEks54lsp4ks53p7Ozp7Owksp0ls53p7e3p7e3d6ujc6ejQ5uPP5uPE4t643tm33tms2tSr2tOf2NCf18+T1MuH0MaG0MV5zMBvyLtuyLthxbdWwrJVwbJKvq1Jvqw+uqg9uqcxtqMwtqIls552u/+RAAAAFHRSTlMAAxEYGRqAi6Ckr7Cys+Pn6Ojr/BXcmpUAAAF+SURBVHja7ddtb4IwEAdw9/zspiul6CY4sUp5+H//b7cUCurC2h7bkm3x3mBD7pder1ziaPS/4vKRfR637vwrZgu4hSc7gDsXwByAU3ACLsENOAQPwC74AFbBC7AJdqByC3ZgBadgB/jKtYcT5hvPR8AP4Gm+aX8XecqpAC8B1S4UUHIisMZW7FZiizURKFDnx3ke1wJyIgAYx2SaNRlQ7UlQAY6qfs6VmhuAUwCeQh62XmKvk05AARU/BEQFZBSgbJrYdoGJ/XvhLkFIU0LXBYk1px1i18ZiyCF2bZsD8ZfuQWw2QAfMVS7MBkQLeQMSG120ak6eb8gfE6+Abh5sP9wLr4EiZLWbB5Xkx6l8BP4MAEL8NPASAUjqgfA6CNADKGnKnQ0GApYNL+FbgLoE8TYcQBJqYkkGosgAOjImyEDIsoyFHRAQgEn9aqk3ngCzpo2L3vxJL3DTvFyGgS480unBouwFrnuBi7HvRR6f9n9N5/dTn/Tpw9mv+r/9DoZVCIA1Yg9nAAAAAElFTkSuQmCC',
  java: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAkFBMVEX///8AAAD////weEv0gFX1elL1gE7p7e3p7e3xflPxflLusJjusZjxf1PxflPwf1Lp7Ozxf1LxflL//v7+9/X98Oz86OPp7e374dnq5uP62c/q39n50cX5ybv4wbD3uKX2sJntrpb1p43uoYP0nYDvm3rvmnnzlHLvlHDvk2/wjWbwjGXyiWPwhlzwhVzxf1MJqFjyAAAAE3RSTlMAAAYhLjAxwMrc3+bn6Oj8/f39gZUOFAAAAcdJREFUeNrl1+lunDAUhuFMm25J2yzHLFOMIWxuM2Te+7+7/KDpmCkZDFaULkdCliz5Ed+xQXB29i/VZvPhOnm+LjdOTQMfk1PF5SxwfRrg8xyQzACOsBI4CGuBX8Jq4ElYD/wUAoBBmAV+fB+PSZLsXWEWgPGYJMkdjuAFdO0I2N459zAJvDkGuhHglh9wFGEZ0HXjcTFwtAPrgGdu3zNCe9iJ1T2o68AenKgXBzqOql0I8FstBmY29BUAuK+zMAAesqAI2446rAdb7gOb6My+DpCxC2tiG9REgH0WBOyWHKQ9W3e9m94PqGkdYZTeD8j244fZSe/5Rsrq3WH5KP3f8k78fwEW1AsCImIAK2KhFANgpAQiKXyAyogBcqVyQMUAsQJKiWKvCJUYINI6AnKxYCUHdFSI9QYqKUspoREDRhroVd5L7g1oBUoDcTxcFNLwLfIFepVWVap6KKSxUgCpqqpcKk+gEBERKaCX3EgPdpjRHkAhhjQCiFJAx7EGjFhAq/4UcAvkRql+aPuwBaUMhyAGKJ+Owu0kcAGkqbY0xgJY0wDGAL0Z0ptyAD5NAu+vfA/y1dvpz/13X298lt98Od/8SX/cjxX8G0u7v7xMAAAAAElFTkSuQmCC',
  html: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAdVBMVEUAAAD////wSzz0VUD1Uj31Tjvp7e3p7e3vVEHvVEHsmY/smo/vVULvVELvVEHp7Ozp7OzwVULwVUHp7e3p7e3p4+Lp2dfq0c3q0Mzqx8LqxsLrvbfrta3rtK3sl4zujoLve23vcmLucWHvZ1fwX03vXkzwVUJvA4h+AAAAFHRSTlMAAxEYGRqAi6Ckr7Cys+Pn6Ojr/BXcmpUAAAE2SURBVHja7dfZboMwEAXQdN/TJr2uCWSzS+//f2IfkAk21DMIRWor5mGEZM0RHtvILBb/K25f8XM8yvV3yAVl4S0P8EkCIACiIAKSIAOCoADyggbICiogJ+SBL1nIA3uKQh4we+kdLqCN9xmYATVgnAuP/mjGA8bRh+dPOjMWMI6+LfrwsaAAonrAxIIMJPWpIAK9+kQQAd+rb4QRgOsDnVWRp9AXolkpmpgKcVc0yxgLSVdVG6krpKui28qdrqerojxMvu2692b+Is3A3wE4Is4JlGXIFQBUZFnUZF0UYUwAmgshQFoAsCSwI3dAGFMDp4zDAdMAY8YAp5ttyFtgOwmora0nTSHkcwMrBdDsDK4GgQeSZFWledNmCwAbkveDwM1Su5GXl8On6fp5rSlfv1z9qv/tbw5O5m0JmkgsAAAAAElFTkSuQmCC',
  vue: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAgVBMVEX///8AAAD///8etKUgtZ8fuKMdsZ3p7e3p7e0ls54ks519zMB+zMEks54lsp4ks53p7Ozp7Owksp0ls53p7e3//v71+fjq9fPp7e3f8O3c6ejU6+fJ5+G94tuw3dWj2M6V08iHzsF5zMB3ybpnw7RWwrJVwbJUvq0/uaUwtqIls54kjjd2AAAAFXRSTlMAAAMRGBkagIugpK+wsrPj5+jo6/wnIWgmAAABR0lEQVR42u3XXU+DMBQG4OG3Tp1uvi1YyoGBK77//wd6gXNdwqDrsmQxvBctN33SHk74mM3+U5Lk/i09nHnipR94SIfC+SjwPgzweQxIRwBPiAR2QizwJ0QDWyEe+BVOADohBvj2hRhgTU+IAT7X3h56gas0NB8TMAxsOJivUYAjCQB2vXvo6tzAyUeYajDVYKrBVIOgh+pmejNdOMAjcjagrlt2k6sdyW5sSxEXBuQQkg6KAiG7sVEAVBUElMhIFrA+oFCzVqoNqoGCIzUaD6hgSVpUQYCFsEFGDxBoY4yGBAENMhaQfcCIiEgddhs1nEa7BXIIBfaYPhAUsCQFhmwVhA6qJa0dL+KSJB2Aqptz0TmELKDFIPPXL3uBJ5JkYXKSZKmhq9KUJEVB7W/gsRe4W4Q28uK6/3P/9mUVsnz1epNc0h/3DwUhKI/nn75VAAAAAElFTkSuQmCC',
  ts: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAn1BMVEX///8AAAD////weEv0gFX1elL1gE7p7e3p7e3xflPusJjusZjxflPxf1Pwf1Lp7Ozp7OzxflLxf1Lp7e3////98e386eTp7e374drq5uP62tDq39nr2M/50sbr0cbsyrz4wbHsxLP3uaXtvansvarttqDttZ/2sJrtrpb1p43up4zuoYP0nYDvmnnzlHLwjWbwjGXyimPwhlzwhVzxf1NuXNuMAAAAFHRSTlMAAAMRGBkagIugr7Cys+Pn6Ojr/Eob7lAAAAGBSURBVHja7dfZcoIwFAZg6V7b2tYejcoWpSJxAYH//Z+tF1RBG0gaZpwu/jfMAPlIThIGOp2/FMu6fWb16VqVyIE71hR0lcBLM4AHFcAUQEUwBErBFNgLxsBOMAc+hRZAIZgAeVUwASJUBBNgHFX6IAUumG7ezsAvAvYrB6cFwiSb74DDY5glczUQAkAoA8orjcAWjoOaOA4SJZA3A1slEBUd9RIA8MaMjT0ASDzdIbAoz0MWABuvrIG3Ad5ZmOeh5jRGQHA4jQEQ6a+DKeAdrwMfmOoCdlbeyypqZmsCS6xkO2CFpR5gA7YMKM8rgGD/pKMsEWgBG/hywN8NTQHk8hEwZiPTAr7s3sr+Pg1wfiv/bwDfiA6wFrEJQEVEPCQi1wAQgpMrROrSApxmJkMQxAGMCMAa5gCnydqwiAWQukQD3gIAYj4g3gYAUhq1KKILpDRpU0SXD2lR0/61CYi5AIDZZOSKug7cS4Gbnu5O6F3KP/evH/s6zftPV9ZP+uP+ANbkNKZaheHxAAAAAElFTkSuQmCC',
  add: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNjIzMDI5ODM1NzAyIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9Ijg2MjczIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIj48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPjwvc3R5bGU+PC9kZWZzPjxwYXRoIGQ9Ik0wIDUxMmMwLTI4Mi43OTQ2NjcgMjI5LjgwMjY2Ny01MTIgNTEyLTUxMiAyODIuNzk0NjY3IDAgNTEyIDIyOS44MDI2NjcgNTEyIDUxMiAwIDI4Mi43OTQ2NjctMjI5LjgwMjY2NyA1MTItNTEyIDUxMi0yODIuNzk0NjY3IDAtNTEyLTIyOS44MDI2NjctNTEyLTUxMnogbTQ2OS4zMzMzMzMtNDIuNjY2NjY3SDE3MC42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMCAwIDg1LjMzMzMzNGgyOTguNjY2NjY2Vjg1My4zMzMzMzNhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDEgMCA4NS4zMzMzMzQgMFY1NTQuNjY2NjY3SDg1My4zMzMzMzNhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDEgMCAwLTg1LjMzMzMzNEg1NTQuNjY2NjY3VjE3MC42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMC04NS4zMzMzMzQgMHYyOTguNjY2NjY2eiIgZmlsbD0iI0UxNTU0NCIgcC1pZD0iODYyNzQiPjwvcGF0aD48L3N2Zz4=',
  note: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACyUlEQVRYR8VXS3LTQBB9rYW8xNxAqQKHHZ5cAOcEmBNANshe4Zwgzg3iVRAbwgkwJ0C+QGR2WKEqyglillZV1FTLkku25dEgnEIrl+fTb153v+4m/MXXCrwuwK8JcBjUJKAtxxmYEniegKYW2J+p3jfTa6lq44vg0klAZwB1CWhW7c8AzQEex2icRupkrjuzE4ATfG7aiD8AGJga3jTEgBi/CJV7vgtEKYDM+PecYpNX6/aIi2LYx2VsbAF4HnxqE1iMG9FtDo6jBNabG/V+WjyzBiB7+e3+jecmOVqgoYpMrADsm/ZdzIg7QuWqfH0FoBV4QwLOzCmtv5OB81C5Q7khBbBMNSvQUc+M30Qo+u9VBmGyFf2MNhGeaFiYx7APxBUpgFbgXRHwVp+vycFP1Y/yPYeBx/J7ptytQJYHMaxbPUc8mqmepDjQuvbmOsRlhnQAZH++rmMhVO5TEnkl4GuVRzdf+q8AxN4DkmMBUEn/YzCwfDCP6DDwfAB5QO0k4jEYADCh1vXHKRG9rOECn4EoVO67srNVMZBnkDCQRnPVt8nAs+CyI2d+qb4wiEzI0v9C5Y5N760NoAi4oKJfGNwJVa9rDKCuC3IAmxJOWOqFIYBJ7SAs0L4q2wmSkxvVvzLRgVUM1E1DuUDiwGK6kCAuGjcHwKPaQiTUNxDfAzjNsmFcjAsTF6RCVFeKRe8fgE5O+WYWVQGQ4hYeudLY1itGurQtsKPZVihGaTlma1pVQgm81k5pbncAcnaty+tjsp1VOc5Y+H8NySqleOGbyHKVaurWmflHeNRLBxr5tptSjqOq3qA2AMbdgux2aVOaX5q25cz+3kEw7hKirrYtX5PXPbpDaI+p0TEaTDY0fgDGoC4bEu2gdDRLO+Cyz3A4tYZgdE2BZIbHMexB7eG0DO1yPIf0kA4zN/OMEYqJSCbiKYN86QdMA/UPsgaIWB5DxqsAAAAASUVORK5CYII=',
  coll: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAD2klEQVRYR8VXPYwTRxT+3sza+2OvYwvTUAAnkJBocpHogQbKHB0VgRIarF06ipCGhlvjniJQUN+lvCogekQqQBRgCnSKEsmczwZ82p3orbzOrr3eHROkPGl18s2b9773vZ+ZIfzPQrr+VafTHEn5Y6TUOSI6rpRaJ6LmdP8LAAMCtmUY/mb3eu907ZYCYMdDIe4T0VVdowCegOgXd3PzSdmeQgBDz7ujgJupSMvsza9v18PwGvV6g2UbcwF8ZdS5PpRS74SUl+r37nGaFmQBADvfl/J3AOurhrtMXyk1EFKezwOxAGDP9x8S8JOOc3n6NKIwhHr9ulSdQbhRtDafjgyAfc/rKKL7pdZYwbJQu30bUAp/3rqFCoCKZYGEKNr+wg2CH9IKMwDTvL/VLbjqhQvgj2W4tRV/RISKaaLqOBCGkQuElLpW73YfJoszAFzxIPpZN/o6R2/bsboaj7HrefHfRGSlAtNxYJhmxiQXZaPbXVsE4PtKyzkQR55En+xJWJi3IYSIGUmnJ81CzMCe728QsKUFwLKQjj7Zk8dCJtep9JBhPGoEQTzYEgC5lS9PnIA4cgRkWZAnT4JsO/5dJAf9fpyKLy9fIhqPcfD+PSavXs22cJ3U2+1Bo9ttzQAMPY9H59m0YePMGViXL2uRUqY0ePAA42fPZmpuu42KUmt8ZiQM8EHyXcaQZcG5caM04jLnzMBfd+9mCrTWbEKa5nk+K2IAw2UF+B9BMPV/93oZ5+xPH8A0PE4Fp2QVYcqZ+jxZALDn+5yLY0UOVgFR5DyfgZwinAfDHWFfv65FAuc8Xfnzm2qtFkwh/i3Coe/3ANwssp43fJbpf3z8GKOdndzluA0PH/7YCIL4NqU9iL5VCqqWBbPRyA6i6TRcbMVUDEw/pyEtyewnx8n8n+nnNOSJ5bqo2PalRhBszxiIW7HkMKpvbs7sseP9nZ34Y6lfvBh/aSAfrlxZ8M/nQq3d7jeC4HiymD2OpeRuyA6kqSYDSDtOn3xxJI6TAZIHgNtPVKuz6DMM8I99z7uqiH7No06cOoXxmzeY7O4WdoLkMXv0KD4/f57Rq9o2rHr9qdvtnksvrHwlCycTfB6NEB4caLUkKwkpUTt0qO+G4XrhlSyxmHc4zXvTBcLOnVZrTxrGWa1LaeJI93I6+fQJk9EIURQtMDKl/Q8jijaWvZYKHyZ8SY2I7iwrzLTHNBCO2nZdLrhHbhh2Vn6YZHqd3wlC8G25owOEa0MaxlOSsrPsMVJYhEWVxVc3ABukFPdxE0TfK6BPSvFjNH6c1qJouyjiefulj1PtUv9KxX8AH4ajMHeKsdwAAAAASUVORK5CYII=',
  all: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACOUlEQVRYR82XjzEDQRSHf6kAHVABKkAFpAJRASpABaQCVIAKUIGkAjoQFTDfzb3M5uzu2ztJZGcyydzt7u97b9+fTU/txpGkQ0mbktYl7dTLR5Imkj4kPUp6Kt22VzARsQtJiCNaMoAB5LwGS67xAC4lnbYQbgoBciPpKkWQAsDS58DFJVbn5nBEBzFvxAA4V8RL3V0KhzeAAGY6mgCIvi9A3ASB2Ao9EQLM2+0pz+CBXXsZAhBwRPsyBkGJngyAVHtLuJ5UIpK7jDNJ15GF06MwgDtJxwkFL1U9sO/EhHtJA9scorUlA6C5AQAV7iFjxr5novP+JfO+D0DO/X/UdpcPAYBwLzN1UTGA5Cubk5fb/wQwAiAVpbFa0eS0ytmvPRmzI7t/W4CBpFuity6nFsBUNu4Cn5JO6rgyGBeg9AjIBppUlb/17hQoflvjIqC5sIRNJwcwbhOEgFIraCY2sJogNiCe84yPpW8OoApCLw0tC2jTiFEzcDPlm84Zupy9OBbEre3mAKo09ApRmIZAcNXim3XEAx7BYo4BUZ6HPT8HUBUiRpdSTKPB9XYxTWVyCuAL6JVpRrgPN8YaEpYO3aIan5Bqx1hPDE1W5kJi/F5N6OiImWXjMG5il9LUUcxDfOr6XJ23fE9dULqCIB7Wh2qf3B8Tik6uS7YBwe2Ik+4zw+v13FyJ5K7ewGr6RXUDjg0PgDWkKJtQ4UpBEKZiAv/L6hCkBCCcDwQf+3tuR4SLESKLODrEi8YPHad9/g3eJ6wAAAAASUVORK5CYII=',
  emp: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEMAAABACAMAAAB2gDrvAAABsFBMVEUAAAD///+q1NT///+/v7/m5v/o6Oi2tsju7u7f3++vv7/y8v/09PSttr/29vb39/ff3+f4+PiuvMP4+Pj5+fn09PTf3+r19fX29vb29vby8vatusL39/fb3+f09Pj09Pj19fX19fWuuML19fX29vb29vb09Pf09Pfc3+fN0tr19fX19fX19fXZ3uP29vb29vj09PatuMH09Pb39/f19ff19ffFzdX19ffb3+X19fWtucL29vb29vj09Pb29vbb4ebc3+b29vb19fb19ffq6/D19fX19ffc3+atuML29vb19fb19fb19fbc3+b19ff19ff09PX19ff29vf09Paut8Lc4Ob29vfb3+bd4eX19fb19fb09Pbb4OXb3+WuuMHw8PPt7/Ktt8Lc4Obc3+atuMLi5Ovc4OXg5OnByNCtt8Le4efd4Oett8L////9/v77/Pz29/n09vf19ffy9Pby8vXx8fXv8PPu8PPt7vLs7fHr7PDp6+/o6u7n6u7m6O3l6Ozl5+zk5+zk5+vk5uvi5urh5Org5Ong5Ojf4+jf4ujd4ebd4Obc4ObR1tzByNCuuMLms+KkAAAAbXRSTlMAAQYICAoLDg8QEBQYHB0gICQmJygtMDQ3Ojo7QEBER0pMT1BTVl1gYGBiZGZsbm9wc3V5en9/gICDhoeJi42PkJGUm5yfoKCoqa2ur7C1uLi5vLy8v8DAwsXMz8/Q09bZ3d/g7e/v8vL2+fz9dCtFvAAAAhFJREFUeNrt1vtXEkEUB/DtqVQSaWlWK1ZUmJmWWvZAyd4plK+oUUolzRdW5mKoJRSi0pX5lz07AmfP7jC7d+2HjofvT7Cz93OGu5fdlSQ7kbuGAGCoS5bsRh6HfEZsKl7Qxrt3whbimtQZky604Qd9OtBGKFeZTqYhnVQ/hdAGA76nYCm6BF+iP9VvaCMCAKnoV2Z8m08BQBhtBAz9eI4fMINhY8wCe96GYcbCDt16c7soFzj7MAzHtQVxTrKLG/ZW+yMMiPiNM3rXxGAbqWanOmRZ5g65JcMkzIit8LKIMjLAyx+UwSVgvWSUjP/KSKzzsowy/sX/dp8Y79QTf3DvQYq61GROXNpWT/zLvbYJdWmqwoyonGaGssrJMrsXZj8cFBNlY3TbpB9Z+kJIHBikFgx6S2TcpzlD0NMspXPnBf2keWOL29NfOYN+qijez4KhxHhZzBu0WF/LxmjBEPeD0mJ9vaPZ9abCqY5rf9cxU2P3kaZLBmlkjEQMkAbEDcYa2oDfuuHYALxhEr7RgDIOW3zpFEUqGabG0YtPUEbLOb3gbHtPRlEGIX2NR7TEZUII2iAkWKUx3qpHyCyCmGAVDzTGQ3bk44xl4vMwq/BojENXgwSfZ3W6rtb7+lHAq9YzvMvrdN/sfm2hvNfXWFsufE6dOH3WfeXG7XuPnvYMFMrevHzc2d5y3VNXc+o4v2wH0pdAHcVwgZQAAAAASUVORK5CYII=',
  error:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACeklEQVRYR8VXS07cQBB9JWEjzSbZwDbjE2TmBCEniH2DZMUyEWxBGQnWKFmyAk7QfQOSG8ycgGELm2GDlAGpomps0/53ewaNN5bl7nqvX72uriZs+KEN48OLwFMc7zHwBcCIgSERDc0CmKcAFgDkfRVqLW+nx4nAMo6/MvAzB+wIzcxzIpqESl11sWglsIzjEYALEMnb/2GeBkBCWs+bJjcSSOVWIHrvj2zNYF4QkARa/6mLU0vAgBNdrwRcmkzMn+tIVAiksl+vvPIye+ZFAIzL6agSSBJx8Md1rj6PxTwNtR7bsQsExO0gungT8Cwo87dQ68vss0DgX5LMCfjQ6NjhEHx3Bzw+1g8ZDEC7u+B5o+khW3Rb66hCoNN4OzsIzs/BNzd4Pj6ukhgMsHVyAooiPO3vA/f3zUIyj7NilSuwjONfIPreJv/W2RlIVCiTsMBl9c8HB+1ZZP4dav1DBr0SSBLZp59aZwrQ6WmRBJCv3IAfHTWn6DX431CpvQKBrvznc0skTJAoMnl3BDdnR7YbbAXY2f0WCZnjBZ6ChEoZ7P4EUsMZAk3GbFlRhYBXClLwbLvVGrNdzlmolDng/E1ogZuciwnLxmyqE20m9NqGZcOVd8fhof82dC5ETW63SPQqREK5ywcm16uWYuB2W6mXVs72gHxs/DAyJN7yOAZy99cqkKowApGU5XfOhclt4EPAPOpsSCRWpyHdAIujrBPQ/tHelBLpNSjxQMyxV1OaMTT9IZF0L31btFnAHPdqy22ZzMWEaNLWLdnjGbgl5ondejVlzelmVFAEkL5R6rjcFzJlZuZq9nJFu1z71ayP51zneCngGtRn3H+TYlgwyD1mTgAAAABJRU5ErkJggg==',
  success:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACiklEQVRYR8WXv28TMRTHv+/SEAmGZkACqRItYoCJJjMidxlgpV2RkA6JToBgYyQSKwPMgOKqf0A7syQpP+bARLeErRJDOiCRhNrIbhw59yN3Ti7ktruz3/fznt+znwlLfmjJ+rACWPnke8RxzxEoAdgAYUM6IATaBPQ4oQ2O3WGVtdM6lgogf+j7DsdLLZhoXKDDiWpDt76bNHYqQL7hl4hQJ1IeWz8yMgOBbVRZJ25yLIAMt3OKfSIUrZWNCUKgx3PY/nubNaPsRAJI8RxHYx7h4NxTB9UoiBDAKOyNeT0PAshIDATKweUIAZxr+m0ibGbpvbalcsJjZdP2BIDKdoH6IsS1TU54OKwwpt8nAApNvwPCehYA64WLyky3/2vSnECn77GrIYAsE+/mhSv4uPlCaVz++jjkD+co681qHIF8y3/jAM/m9V6LF1fOY+/4C3aO3ocBgLdDlz2XP8YAhZYv69QNjq6s3lCfDk9+JLKlER8ZafVd5k0CxKz/n8pZTu4cfcDe8edYCAtxdXboajAjIKKsv752H0/W7kyFsBHXGn2XKe1EADno3fVHeHDpViTELOLSUBggoQSjIGYVFwLfBh5TB1xiEprLYkK86h7g6dpdTMv2KVkbTsK0ZWhCSIG4UptWMjyqDG02Ig0xi7gEi9yI5A+brViu//ffPxP3htAAgW7fY6qVm8gB+bL0w0hCLPg4Hmd/ZARUFM76wCYRVu3jGz9DCJwMZDcd6A//W0tmJp6JmdSUHswbCek5z2HLqinVhKPlYLO2aGrHE9iaqS03wzS6mNRSd0sCXe6gZrZecdmR6mZkRgQOfAcoCYGijoz0lAg9DnU1Y5lfzbKshqAtqwgsAuQfHuc2MAH5ndYAAAAASUVORK5CYII=',
  warning:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACQUlEQVRYR82XsVIbMRCG/03mjhka0lDHeYLYTwDumYmOmiKhoQxvED9CMkNDBcxQIxX0Tt7AfgOnpjFlzITNrHx2ZN/ZXukI5JrzjbXaT792VyvCCz/0wv4RBfBgzD4DHwC0GWgRUcsvgHkAYAxA3le5c/JWPSqAiTEfGfgyd7hhamYeEVEvt/ZqE8VagIkxbQAXIJJ3/MM8yICCnButMl4JUMptQfQm3nNgwTwmoMic+143Ty2Ad07Ub+R4yZiYu3UQFYBS9n7jlS/TM48zoLO8HVWAopAIfq9Z/atu1w977CvFYh7kznXCuRcAJNpBdKFxLmOymxs/9OHwUGsiKfspd+5yZrAA8KsoRgS81c6WAiApuuXcuwpASuClAJSFqzMrVnMFJsZ8BdFn7eqTt0AMmb/lzp3Kz78ARSF5uvcsAMCP3Nr9BYDY/W+owDwbQgU4ZvWNAADk1nrf/w/As24BMMyt9QdcsyC8vp4WoqOj2N2rBmFKGlKr7EdGK0/berC6NEwpRLHLno9nrhYi+TM2Dl4fHwPb2/h9dqZmYeDnlrVT6cIYkI+ow2h3F9n5+TQGTk6AuzsdxLrDyEPEHMcHB97p4+2tznkQ/bUKlCq0QSRleUc7q3Lcfcbc3tiQeEn/QUuGIPBC4PVNKZF7AiXuidlENaUzQt8fEkn3omrRarZimDGbpLY8nMxfTIh62m5JUo2Ye2HrtSpOVDejBUUA6Ruljst9YabM0F/Nple0yye/mimjPGlYlAJJHjYY/QF2rv8h2UyQGQAAAABJRU5ErkJggg==',
};
let data = []; //笔记数据
let typeData = []; //笔记本类型
let currentTypePath = 'mhnotedata/note_data.json';
let typeActionId = '';
let showActions = new Map();

const initEle = document.querySelector('.mh-code'); //初始化显示代码
const searchBtn = document.querySelector('.search'); //搜索按钮
const confirmBtn = document.querySelector('.confirm'); //编辑或者新增时的确定按钮
const cancelBtn = document.querySelector('.cancel'); //同上 取消按钮
const cardEle = document.querySelector('.card'); //同上,展示卡片
const fileNameEle = document.querySelector('.fileName'); //同上,展示卡片中的文件名
const filePathEle = document.querySelector('.filePath'); //同上,展示卡片中的路径
const selectTypeEle = document.querySelector('#note-types'); //同上,展示卡片中的选择
const searchBoxEle = document.querySelector('.search-box'); //搜索模块
const listEle = document.querySelector('.list'); //文章显示模块
const addBtn = document.querySelector('.add'); //新增按钮
const editTitleEle = document.querySelector('.edit-title'); //编辑时头部显示
const searchComfirmBtn = document.querySelector('.search-comfirm'); //搜索模块中确定按钮
const searchCancelBtn = document.querySelector('.search-cancel'); // 搜索模块中取消按钮
const noteMsgEle = document.querySelector('.note-msg'); // 搜索后展示搜索词
const searchedCancelBtn = document.querySelector('.searched-cancel'); // 搜索后重置按钮
/**
 * @name 编辑框的类
 */
class EditBox {
  constructor(el) {
    this.EditBoxEle = el;
    this.status = 'add';
    this.editId = '';
    this.type = 'code';
    this.code = '';
    this.fileName = '';
    this.filePath = '';
  }
  openBox(state, data = { id: '', type: 'code' }) {
    // hljs.highlightAll();
    this.status = state;
    this.editId = data.id;
    this.type = data.type;
    this.code = data.code;
    this.fileName = data.fileName;
    this.filePath = data.filePath;
    // this.category = '';
    if (state === 'add') {
      editTitleEle.innerHTML = '新增笔记';
    } else {
      selectTypeEle.value = currentTypePath;
      editTitleEle.innerHTML = '编辑笔记';
    }
    fileNameEle.innerHTML = data.fileName;
    filePathEle.innerHTML = data.filePath;
    this.EditBoxEle.style.top = '30px';
  }
  closeBox() {
    this.EditBoxEle.style.top = '100%';
    this.clearBox();
  }
  initCode(code) {
    let highCode = hljs.highlightAuto(code).value;
    initEle.innerHTML = highCode;
  }
  initSelect() {
    typeData.forEach((item) => {
      // let htmlItem = `<option value="${item.dataPath}">${item.name}</option>`;
      if (item.id !== 'add') {
        const selectItem = selectTypeEle.appendChild(document.createElement('option'));
        selectItem.value = item.dataPath;
        selectItem.innerText = item.name;
      }
    });
  }
  clearBox() {
    const title = document.querySelector('.card-add-title');
    const des = document.querySelector('.card-add-des');
    title.value = '';
    des.value = '';
    initEle.innerHTML = '';
    this.editId = '';
    this.type = 'code';
    fileNameEle.innerHTML = '';
    filePathEle.innerHTML = '';
  }
}

/**
 * @name 搜索框的类
 */

class SearchBox {
  constructor(el) {
    this.searchELe = el;
  }
  open() {
    console.log('dakai');
    this.searchELe.style.top = '0';
  }
  close() {
    this.searchELe.style.top = '-70px';
  }
}

/**
 * @name 提示确认框
 * @param {*} content 提示的内容
 * @param {*} tpsText 提示标题
 * @param {confirmBtnText,cancelBtnText} otherData 按钮参数
 * @returns new Promise 返回Promise
 */

function noteComfirm(content, tpsText, otherData) {
  return new Promise((resolve, reject) => {
    const modal = document.querySelector('.modal');
    modal.style.display = 'block';
    const bodyELe = document.querySelector('.note-body');
    const comfimELe = bodyELe.appendChild(document.createElement('div'));
    comfimELe.classList.add('comfim-box');
    comfimELe.innerHTML = `
    <div class="comfim-title">${tpsText}</div>
    <div class="comfim-msg">
      <img src="${imgBase.warning}" class="comfim-msg-img" alt="" />
      <div class="comfim-msg-text">${content}</div>
    </div>
    <div class="comfim-action">
      <button class="comfim-sure">${otherData.confirmBtnText}</button>
      <button class="comfim-cancele">${otherData.cancelBtnText}</button>
    </div>
    `;
    comfimELe.querySelector('.comfim-sure').addEventListener('click', () => {
      // console.log('点击了确认');
      bodyELe.removeChild(comfimELe);
      modal.style.display = 'none';
      resolve();
    });
    comfimELe.querySelector('.comfim-cancele').addEventListener('click', () => {
      // console.log('点击了取消');
      bodyELe.removeChild(comfimELe);
      modal.style.display = 'none';
      reject();
    });
  });
}

/**
 * @name 提示框
 * @param {*} type 显示类型 success 成功 error失败
 * @param {*} message 需要提示的内容,能展示的内容较少
 * @param {*} time 需要提示的显示时间 默认500ms
 */

function showTost(type, message, time = 500) {
  const bodyELe = document.querySelector('.note-body');
  const tostELe = bodyELe.appendChild(document.createElement('div'));
  tostELe.classList.add('showTps');
  tostELe.innerHTML = `
    <img src="${imgBase[type]}" alt="" />
    <span>${message}</span>
  `;
  setTimeout(() => {
    bodyELe.removeChild(tostELe);
  }, time);
}

const editBox = new EditBox(cardEle);
const searchBox = new SearchBox(searchBoxEle);

confirmBtn.addEventListener('click', () => {
  const titleData = document.querySelector('.card-add-title').value;
  const desData = document.querySelector('.card-add-des').value || '暂无描述内容!';
  if (!titleData) {
    showTost('error', '请输入标题!', 2000);
    return false;
  }
  if (editBox.status === 'add') {
    let id = uuid(16, 16);
    let dataPath = selectTypeEle.value ? selectTypeEle.value : currentTypePath;
    let postdata = {
      id: id,
      type: editBox.type,
      title: titleData,
      des: desData,
      code: editBox.code,
      fileName: editBox.fileName,
      filePath: editBox.filePath,
    };

    callVscode({ cmd: 'insertData', key: 'mh_insert_data', value: { data: postdata, dataPath: dataPath } }, (message) => {
      if (message.type === 'ok') {
        if (dataPath === currentTypePath) {
          data.unshift(postdata);
        }
        showTost('success', '新增成功!', 2000);
        initNote(data);
      } else {
        showTost('error', '新增失败!', 2000);
      }
    });
  } else {
    let index = data.findIndex((item) => item.id === editBox.editId);
    data[index].title = titleData;
    data[index].des = desData;
    let upData = data[index];
    callVscode({ cmd: 'updateData', key: 'mh_insert_data', value: { data: upData, dataPath: currentTypePath } }, (message) => {
      showTost('success', '编辑成功!', 2000);
    });
    initNote(data);
  }
  editBox.closeBox();
});
cancelBtn.addEventListener('click', () => {
  if (editBox.status === 'add') {
    noteComfirm('取消新增笔记会丢失本次内容,需要从编辑器重新选择内容,请确认是否取消', '取消提示', {
      confirmBtnText: '确定',
      cancelBtnText: '取消',
    })
      .then(() => {
        editBox.closeBox();
        // showTost('success', '成功取消!', 2000);
      })
      .catch(() => {
        // editBox.closeBox();
      });
  } else {
    editBox.closeBox();
    // showTost('success', '成功取消!', 2000);
  }
});

function initNote(data, keyword = '') {
  listEle.innerHTML = '';
  if (data.length === 0) {
    listEle.innerHTML = `
    <div class="empty">
      <img src="${imgBase.emp}" alt="" />
      <span>当前笔记本为空,请先添加</span>
    </div>
    `;
  } else {
    data.forEach((item) => {
      createCardELement(item, keyword);
    });
  }
}
initNote(data);

/**
 * @name 打开笔记
 * @param {*} data
 */
function openData(data) {
  const title = document.querySelector('.card-add-title');
  const des = document.querySelector('.card-add-des');
  title.value = data.title;
  des.value = data.des;

  editBox.initCode(data.code);
  editBox.openBox('edit', data);
}

/**
 * @name 收藏笔记
 * @param {*} id
 */
function collectNote(id) {
  noteComfirm('请确认是否收藏当前笔记', '提示', {
    confirmBtnText: '确定',
    cancelBtnText: '取消',
  })
    .then(() => {
      callVscode({ cmd: 'collectNote', key: 'mh_collect_data', value: id }, (message) => {
        if (message.type === 'error') {
          showTost('error', '收藏失败!', 1000);
          return false;
        } else {
          let index = data.findIndex((item) => item.id === id);
          data.splice(index, 1);
          showTost('success', '收藏成功!', 2000);
          initNote(data);
        }
      });
    })
    .catch(() => {
      // editBox.closeBox();
    });
}
/**
 * @name 移动笔记
 * @param {*} id
 * @param {*} dataPath
 */
function moveNote(id, dataPath) {
  callVscode({ cmd: 'moveNote', key: 'mh_move_data', value: { id: id, formPath: currentTypePath, movePath: dataPath } }, (message) => {
    if (message.type === 'error') {
      showTost('error', '移动失败!', 1000);
      return false;
    } else {
      let index = data.findIndex((item) => item.id === id);
      data.splice(index, 1);
      showTost('success', '移动成功!', 2000);
      initNote(data);
    }
  });
}
/**
 * @name 删除笔记
 * @param {*} id
 */
function removeNote(id) {
  noteComfirm('请确认是否删除当前笔记', '提示', {
    confirmBtnText: '确定',
    cancelBtnText: '取消',
  })
    .then(() => {
      callVscode({ cmd: 'removeNote', key: 'mh_remove_data', value: { id: id, dataPath: currentTypePath } }, (message) => {
        if (message.type === 'error') {
          showTost('error', '删除失败!', 1000);
          return false;
        } else {
          let index = data.findIndex((item) => item.id === id);
          data.splice(index, 1);
          showTost('success', '删除成功!', 2000);
          initNote(data);
        }
      });
    })
    .catch(() => {
      // editBox.closeBox();
    });
}

function formatkey(val, keyword) {
  let res = new RegExp('(' + keyword + ')', 'g');
  let text = val;
  text = text.replace(res, "<span class='red'>" + keyword + '</span>');
  // console.log(text)
  return text;
}
function createCardELement(data, keyword = '', type) {
  let nodeCardEle;
  if (listEle.children[0] && type === 'add') {
    nodeCardEle = listEle.insertBefore(document.createElement('div'), listEle.children[0]);
  } else {
    nodeCardEle = listEle.appendChild(document.createElement('div'));
  }
  nodeCardEle.classList.add('note-card');
  if (currentTypePath === 'mhnotedata/coll_data.json') {
    nodeCardEle.innerHTML = `
  <div class="note-card-data" >
    <img src="${imgBase[data.type] || imgBase.code}" alt="" class="type" />
    <div class="text-box">
      <div class="card-title">${formatkey(data.title, keyword)}</div>
      <div class="card-des">
        ${data.des}
      </div>
    </div>
  </div>
  <div class="note-action">
    
    <div class="note-action-edit">编辑</div>
    <div class="note-action-del" onclick="removeNote('${data.id}')">删除</div>
  </div>
  `;
    //<div class="note-action-con" onclick="collectNote('${data.id}')">移动</div>
  } else {
    nodeCardEle.innerHTML = `
  <div class="note-card-data" >
    <img src="${imgBase[data.type] || imgBase.code}" alt="" class="type" draggable=true/>
    <div class="text-box">
      <div class="card-title">${formatkey(data.title, keyword)}</div>
      <div class="card-des">
        ${data.des}
      </div>
    </div>
  </div>
  <div class="note-action">
    
    <div class="note-action-edit">编辑</div>
    <div class="note-action-del" onclick="removeNote('${data.id}')">删除</div>
  </div>
  `; //<div class="note-action-con" onclick="collectNote('${data.id}')">收藏</div>
  }

  const noteActionEdit = nodeCardEle.querySelector('.note-action-edit');
  noteActionEdit.addEventListener('click', () => {
    openData(data);
  });
  nodeCardEle.setAttribute('onclick', 'openListAction(this)');
  // nodeCardEle.setAttribute('onmouseover', 'openListAction(this)');
  // nodeCardEle.setAttribute('onmouseleave', 'closeListAction(this)');
  // nodeCardEle.setAttribute('draggable', true);
  nodeCardEle.querySelector('.type').ondragstart = function (event) {
    // nodeCardEle.style.width = '20px';
    // nodeCardEle.style.height = '20px';
    var e = event || window.event;
    nodeCardEle.style.background = '#f1c8a29a';
    nodeCardEle.querySelector('.note-action').style.display = 'none';
    e.dataTransfer.setData('noteData', data.id); //拖拽时设置数据
    console.log('开始拖拽', data.title);
  };
  nodeCardEle.querySelector('.type').ondragend = function () {
    nodeCardEle.style.background = 'var(--vscode-scrollbarSlider-background)';
    nodeCardEle.querySelector('.note-action').style.display = 'flex';
    console.log('拖拽结束', data.title);
  };
}

searchBtn.addEventListener('click', () => {
  searchBox.open();
});
searchComfirmBtn.addEventListener('click', () => {
  const keywordEle = document.querySelector('.keywords');
  const sarchData = data.filter((item) => item.title.includes(keywordEle.value));
  noteMsgEle.innerHTML = `当前列表:搜索词关键词 <span class="red">${keywordEle.value}</span>`;
  searchedCancelBtn.classList.add('show');
  initNote(sarchData, keywordEle.value);
  searchBox.close();
});
searchCancelBtn.addEventListener('click', () => {
  searchBox.close();
});

searchedCancelBtn.addEventListener('click', () => {
  noteMsgEle.innerHTML = `当前列表:全部`;
  searchedCancelBtn.classList.remove('show');
  initNote(data);
});

window.addEventListener('message', (event) => {
  const message = event.data;
  switch (message.cmd) {
    case 'vscodeCallback':
      console.log(message.data);
      (callbacks[message.cbid] || function () {})(message.data);
      delete callbacks[message.cbid];
      break;
    case 'addNote':
      console.log('Webview接收到的消息：', message);
      addBtn.addEventListener('click', () => {
        // cardEle.style.top = '50px';
        let code = message.code;
        editBox.initCode(code);
        editBox.openBox('add', message);
      });
      addBtn.click();
      // delete callbacks[message.cbid];
      break;
    case 'initNote':
      data = message.data.data;
      initNote(data);
      break;
    case 'initNoteType':
      typeData = message.data.data;
      editBox.initSelect();
      initType(typeData);
      break;
    default:
      console.log('Webview接收到的消息：', message);
      break;
  }
});

let noteActionClickMap = new Map();
/**
 * 打开笔记列表的编辑
 */
function openListAction(e) {
  if (noteActionClickMap.has('clicked')) {
    const oldEle = noteActionClickMap.get('clicked').querySelector('.note-action');
    oldEle.style.width = '0';
  }
  if (noteActionClickMap.get('clicked') === e) {
    const ele = e.querySelector('.note-action');
    ele.style.width = '0';
    noteActionClickMap.delete('clicked');
  } else {
    const ele = e.querySelector('.note-action');
    ele.style.width = '120px';
    noteActionClickMap.set('clicked', e);
  }
}
function closeListAction(e) {
  const ele = e.querySelector('.note-action');
  ele.style.width = '0';
}

/**
 * 打开关闭分类也操作
 */

function openTypeAction(e, id) {
  typeActionId = id;
  const ele = e.querySelector('.type-action');
  ele.style.width = '180px';
}
function closeTypeAction(e) {
  const ele = e.querySelector('.type-action');
  ele.style.width = '0';
}

/**
 * @name 切换分类
 * @param {*} id
 */

function changeType(path, e) {
  if (currentTypePath === path) {
    return false;
  }

  currentTypePath = path;
  const oldEle = showActions.get('selected').querySelector('.type-box-msg');
  oldEle.style.background = 'var(--vscode-terminal-ansiBrightBlack)';
  e.querySelector('.type-box-msg').style.background = '#afafaf';
  showActions.set('selected', e);
  getNoteTypeData(path);
}

function getNoteTypeData(path) {
  callVscode({ cmd: 'changeNoteType', key: 'mh_change_data', value: path }, (message) => {
    data = message.data.data;
    initNote(data);
  });
}

function initType(data) {
  document.querySelector('.main-type-list').innerHTML = '';
  data.forEach((item, index) => {
    const typeCardEle = document.querySelector('.main-type-list').appendChild(document.createElement('div'));
    typeCardEle.classList.add('type-box');
    if (item.id === 'add') {
      typeCardEle.innerHTML = `
      <div class="type-box-msg">
        <img src="${imgBase[item.imgUrlCode]}" alt="${item.name}" title=""${item.name}" />
        <div>${item.name}</div>
      </div>
      <div class="type-action">
        <div class="type-action-add">
          <input type="text" class="note-add-typename" placeholder="输入分类名" />
          <span class="note-add-comfim" onclick="addType()">确定</span>
        </div>
      </div>  
    `;
    } else if (item.id === 'noteList' || item.id === 'collection') {
      typeCardEle.innerHTML = `
      <div class="type-box-msg">
        <img src="${imgBase[item.imgUrlCode]}" alt="${item.name}" title=""${item.name}" />
        <div>${item.name}</div>
      </div>
      <div class="type-action">
        <div class="type-action-import" onclick="importTypeData()">导出</div>
        <div class="type-action-con spacilBorder" onclick="clearTypeData()">清空</div>
      </div>     
    `;
      typeCardEle.setAttribute('onclick', `changeType('${item.dataPath}',this)`);
    } else {
      typeCardEle.innerHTML = `
      <div class="type-box-msg">
        <img src="${imgBase[item.imgUrlCode]}" alt="${item.name}" title=""${item.name}" />
        <div>${item.name}</div>
      </div>
      <div class="type-action">
       <div class="type-action-import" onclick="importTypeData()">导出</div>
        <div class="type-action-con" onclick="clearTypeData()">清空</div>
        <div class="type-action-del" onclick="delType()" >删除</div>
      </div>     
    `;
      typeCardEle.setAttribute('onclick', `changeType('${item.dataPath}',this)`);
    }
    if (item.dataPath === currentTypePath) {
      const typeBoxMsg = typeCardEle.querySelector('.type-box-msg');
      typeBoxMsg.style.background = '#afafaf';
      showActions.set('selected', typeCardEle);
    }
    typeCardEle.setAttribute('onmouseover', `openTypeAction(this,'${item.id}')`);
    typeCardEle.setAttribute('onmouseleave', 'closeTypeAction(this)');
    typeCardEle.ondragover = function (event) {
      var event = event || window.event;
      // console.log('在目标元素中拖拽');
      typeCardEle.querySelector('.type-action').style.display = 'none';
      event.preventDefault();
    };
    typeCardEle.ondrop = function (ev) {
      ev.preventDefault(); //阻止默认行为
      let noteDataId = ev.dataTransfer.getData('noteData'); //拖拽时设置数据
      if (item.dataPath !== currentTypePath) {
        noteComfirm('请确认是否移动当前笔记', '提示', {
          confirmBtnText: '确定',
          cancelBtnText: '取消',
        })
          .then(() => {
            moveNote(noteDataId, item.dataPath);
          })
          .catch(() => {
            // editBox.closeBox();
          });
      } else {
        showTost('error', '不可移动', 1000);
      }
      typeCardEle.querySelector('.type-action').style.display = 'flex';
    };
  });
}

function addType() {
  const name = document.querySelector('.note-add-typename').value;
  if (!name) {
    showTost('error', '请输入内容!', 2000);
    return false;
  }
  let id = uuid(8, 16);
  const addData = { id: id, name: name, imgUrlCode: 'all', dataPath: `mhnotedata/note_${id}.json` };
  callVscode({ cmd: 'insertType', key: 'mh_insert_type', value: addData }, (message) => {
    if (message.type === 'ok') {
      typeData.splice(typeData.length - 1, 0, addData);
      currentTypePath = addData.dataPath;
      getNoteTypeData(currentTypePath);
      showTost('success', '新增成功!', 2000);
      initType(typeData);
    } else {
      showTost('error', '新增失败!', 2000);
    }
  });
}
function delType(e) {
  const index = typeData.findIndex((item) => item.id === typeActionId);
  let postData = typeData[index];
  noteComfirm('请确认是否删除当前笔记分类', '提示', {
    confirmBtnText: '确定',
    cancelBtnText: '取消',
  })
    .then(() => {
      callVscode({ cmd: 'removeType', key: 'mh_remove_type', value: postData }, (message) => {
        if (message.type === 'error') {
          showTost('error', '删除失败!', 2000);
          return false;
        } else {
          if (postData.dataPath === currentTypePath) {
            currentTypePath = 'mhnotedata/note_data.json';
            getNoteTypeData(currentTypePath);
          }
          typeData.splice(index, 1);
          showTost('success', '删除成功!', 2000);
          initType(typeData);
        }
      });
    })
    .catch(() => {
      // editBox.closeBox();
    });

  if (e && e.stopPropagation) {
    e.stopPropagation();
  } else {
    window.event.cancelBubble = true;
  }
}
function clearTypeData(e) {
  const index = typeData.findIndex((item) => item.id === typeActionId);
  noteComfirm('请确认是否清除当前笔记分类', '提示', {
    confirmBtnText: '确定',
    cancelBtnText: '取消',
  })
    .then(() => {
      callVscode({ cmd: 'clearTypeData', key: 'mh_clear_type', value: typeData[index] }, (message) => {
        if (message.type === 'error') {
          showTost('error', '清除失败!', 2000);
          return false;
        } else {
          data = [];
          showTost('success', '清除成功!', 2000);
          initNote(data);
        }
      });
    })
    .catch(() => {
      // editBox.closeBox();
    });

  if (e && e.stopPropagation) {
    e.stopPropagation();
  } else {
    window.event.cancelBubble = true;
  }
}
function importTypeData(e) {
  const index = typeData.findIndex((item) => item.id === typeActionId);
  noteComfirm('请确认是否导出当前笔记分类', '提示', {
    confirmBtnText: '确定',
    cancelBtnText: '取消',
  })
    .then(() => {
      callVscode({ cmd: 'importNote', key: 'mh_import_type', value: typeData[index] }, (message) => {
        if (message.type === 'error') {
          showTost('error', '导出失败!', 2000);
          return false;
        } else {
          showTost('success', '导出成功!', 2000);
        }
      });
    })
    .catch(() => {
      // editBox.closeBox();
    });

  if (e && e.stopPropagation) {
    e.stopPropagation();
  } else {
    window.event.cancelBubble = true;
  }
}
