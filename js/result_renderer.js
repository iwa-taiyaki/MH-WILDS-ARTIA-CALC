/* shared result renderer logic */
export function buildSkillMatrix(r, wSkills, assignment, SKILL_NAME_TO_ID, autoSS, autoGS) {
    const matrix = {};
    const getM = (sid) => matrix[sid] || (matrix[sid] = { weapon: 0, 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, talisman: 0, total: 0 });

    // 武器固定スキル
    Object.entries(wSkills).forEach(([sid, pts]) => {
        getM(sid).weapon += pts; getM(sid).total += pts;
    });
    if (autoSS) { getM(autoSS).weapon += 1; getM(autoSS).total += 1; }
    if (autoGS) { getM(autoGS).weapon += 1; getM(autoGS).total += 1; }
    
    // 装飾品
    assignment.forEach(ass => {
        if (ass.deco.sk) ass.deco.sk.forEach(s => {
            const sid = SKILL_NAME_TO_ID[s.n];
            if (sid) {
                if (ass.piece === 'weapon') getM(sid).weapon += s.l;
                else if (ass.piece === 'talisman') getM(sid).talisman += s.l;
                else getM(sid)[ass.piece] += s.l;
                getM(sid).total += s.l;
            }
        });
    });

    // 防具パーツ
    const armorItems = [r.h, r.c, r.a, r.w, r.l];
    armorItems.forEach((item, pIdx) => {
        if (item.sk) item.sk.forEach(s => { const sid = SKILL_NAME_TO_ID[s.n]; if (sid) { getM(sid)[pIdx] += s.l; getM(sid).total += s.l; } });
        if (item.ss) { 
            item.ss.split(',').forEach(sName => {
                const sid = SKILL_NAME_TO_ID[sName.trim()]; 
                if (sid) { getM(sid)[pIdx] += 1; getM(sid).total += 1; } 
            });
        }
        if (item.gs) { 
            item.gs.split(',').forEach(sName => {
                const sid = SKILL_NAME_TO_ID[sName.trim()]; 
                if (sid) { getM(sid)[pIdx] += 1; getM(sid).total += 1; } 
            });
        }
    });

    // 護石
    Object.entries(r.t.skills).forEach(([sid, pts]) => { getM(sid).talisman += pts; getM(sid).total += pts; });

    return matrix;
}

export function sortActivatedSkills(matrix, SKILLS, SKILL_BY_ID) {
    return Object.keys(matrix).filter(sid => {
        const s = SKILL_BY_ID[sid];
        if (!s) return false;
        if (s.mainCategory === 'series' || s.isSeriesSkill) return matrix[sid].total >= 1;
        if (s.mainCategory === 'group' || s.isGroupSkill) return matrix[sid].total >= 1;
        return matrix[sid].total > 0;
    }).map(sid => {
        const s = SKILL_BY_ID[sid];
        const m = matrix[sid];
        let name = s.name;
        let lvl = Math.min(m.total, s.maxLevel || 10);
        let lvlText = `Lv${lvl}`;

        if (s.mainCategory === 'series' || s.isSeriesSkill) {
            const slvl = (m.total >= 4) ? 2 : (m.total >= 2 ? 1 : 0);
            const effect = s.effects.find(e => e.level === slvl);
            const activatedName = effect ? effect.name : s.name;
            name = `[S] ${s.name} (${activatedName})`;
            lvlText = `Lv${slvl}`;
            lvl = slvl;
            if (slvl === 0) {
                name = `[S] ${s.name} (未発動)`;
                lvlText = "-";
            }
        } else if (s.mainCategory === 'group' || s.isGroupSkill) {
            if (m.total >= 3) { 
                const activatedName = s.effects[0].name;
                name = `[G] ${s.name} (${activatedName})`; 
                lvlText = "Lv1"; 
                lvl = 1; 
            } else { 
                name = `[G] ${s.name} (未発動)`; 
                lvlText = "-"; 
                lvl = 0; 
            }
        }
        return { id: sid, name, lvl, lvlText, cat: s.mainCategory || 'support', m };
    }).sort((a,b) => {
        const sA = SKILL_BY_ID[a.id];
        const sB = SKILL_BY_ID[b.id];
        const catPoints = { 'weapon': 1, 'armor': 2, 'series': 3, 'group': 4, 'support': 2, 'resistance': 2 };
        const pA = catPoints[a.cat] || 2;
        const pB = catPoints[b.cat] || 2;
        if (pA !== pB) return pA - pB;
        if (a.lvl !== b.lvl) return b.lvl - a.lvl;
        return SKILLS.indexOf(sA) - SKILLS.indexOf(sB);
    });
}
