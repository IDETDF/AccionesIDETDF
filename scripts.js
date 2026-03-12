const URL_CAPACITACIONES = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDx5fcilT2podQJhr7u8u_uNM07AJIKAw_vykGYnmX1clqC_Y67Bjh1liuHISqoNloOsjrLQF7XjbZ/pub?gid=0&single=true&output=csv";
const URL_ASISTENCIAS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDx5fcilT2podQJhr7u8u_uNM07AJIKAw_vykGYnmX1clqC_Y67Bjh1liuHISqoNloOsjrLQF7XjbZ/pub?gid=2017366916&single=true&output=csv";
const URL_DEFINICIONES = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDx5fcilT2podQJhr7u8u_uNM07AJIKAw_vykGYnmX1clqC_Y67Bjh1liuHISqoNloOsjrLQF7XjbZ/pub?gid=1379507086&single=true&output=csv";
const URL_TIPOS_ASISTENCIA = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDx5fcilT2podQJhr7u8u_uNM07AJIKAw_vykGYnmX1clqC_Y67Bjh1liuHISqoNloOsjrLQF7XjbZ/pub?gid=929704418&single=true&output=csv";
const URL_ADHESIONES = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDx5fcilT2podQJhr7u8u_uNM07AJIKAw_vykGYnmX1clqC_Y67Bjh1liuHISqoNloOsjrLQF7XjbZ/pub?gid=673199731&single=true&output=csv";
const URL_COMUNICACION = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDx5fcilT2podQJhr7u8u_uNM07AJIKAw_vykGYnmX1clqC_Y67Bjh1liuHISqoNloOsjrLQF7XjbZ/pub?gid=1420585563&single=true&output=csv";

const PALETTE = { orange: '#FD8D00', blue: '#1DBFFE', dark: '#353535', light: '#f9f9f9' };
const EXTENDED_PALETTE = [
    '#3B82F6', // Azul Rey
    '#EC4899', // Rosa
    '#00D284', // Turquesa
    '#A855F7', // Púrpura
    '#FBBF24', // Ámbar
    '#FF4B4B', // Coral
    '#8BC34A', // Verde Lima
    '#607D8B', // Azul Grisáceo
    PALETTE.blue, PALETTE.orange, PALETTE.dark
];

const norm = (str) => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";

async function initDashboard() {
    try {
        const fetchCSV = (url) => new Promise((res, rej) => {
            Papa.parse(url, { download: true, header: true, skipEmptyLines: true, 
                complete: (r) => res(r.data), error: (e) => rej(e) 
            });
        });

        const [caps, asis, defs, tiposAsis, adhesiones, comunicacion, comWeb] = await Promise.all([
            fetchCSV(URL_CAPACITACIONES),
            fetchCSV(URL_ASISTENCIAS),
            fetchCSV(URL_DEFINICIONES),
            fetchCSV(URL_TIPOS_ASISTENCIA),
            fetchCSV(URL_ADHESIONES),
            fetchCSV(URL_COMUNICACION),
        ]);

        renderKPIs(caps);
        renderCapacitacionesCharts(caps);
        renderAsistenciasChart(asis);
        renderAdhesionesCharts(adhesiones);
        renderComunicacionCharts(comunicacion);

        renderGlosarioRoles(defs);
        renderInfografiaAsistencias(tiposAsis);

    } catch (e) { console.error("Error en la carga:", e); }
}

function renderKPIs(data) {
    let insc = 0, cert = 0, horas = 0;
    data.forEach(r => {
        Object.keys(r).forEach(key => {
            const k = norm(key);
            if (k.includes('inscriptos')) insc += Number(r[key]) || 0;
            if (k.includes('certificados')) cert += Number(r[key]) || 0;
            if (k.includes('duracion')) horas += Number(r[key]) || 0;
        });
    });

    const totalAct = data.length;
    const pctCert = insc > 0 ? ((cert / insc) * 100).toFixed(1) + '%' : '0%';

    document.getElementById('total-inscriptos').innerText = insc.toLocaleString();
    document.getElementById('total-certificados').innerText = cert.toLocaleString();
    document.getElementById('total-horas').innerText = `${horas} horas`;
    document.getElementById('pct-cert').innerText = pctCert;
    document.getElementById('total-act').innerText = totalAct;
}

function renderCapacitacionesCharts(data) {
    const años = {}, inscAño = {}, certAño = {};
    const artData = {};
    const finData = {};
    const inscAñoTipo = {}; 
    const tiposActividad = new Set(); 
    const modalidades = new Set();
    const modTipoData = {}; 

    let totalInsc = 0, totalCert = 0, enCurso = 0;

    data.forEach(r => {
        const año = r.año || 'S/D';
        const insc = Number(r.cantidad_inscriptos) || 0;
        const cert = Number(r.cantidad_certificados) || 0;
        
        const art = r.articulacion || 'Autogestionado';
        const fin = norm(r.financiamiento || 'autogestionado').includes('externo') ? 'Externo' : 'Autogestionado';
        const tipoAct = r.tipo_actividad || 'Otros';
        const mod = r.modalidad || 'S/D';
        const estado = norm(r.estado || "");

        años[año] = (años[año] || 0) + 1;
        inscAño[año] = (inscAño[año] || 0) + insc;
        certAño[año] = (certAño[año] || 0) + cert;

        artData[art] = (artData[art] || 0) + 1;
        finData[fin] = (finData[fin] || 0) + 1;

        tiposActividad.add(tipoAct);
        if (!inscAñoTipo[año]) inscAñoTipo[año] = {};
        inscAñoTipo[año][tipoAct] = (inscAñoTipo[año][tipoAct] || 0) + insc;

        modalidades.add(mod);
        if (!modTipoData[tipoAct]) modTipoData[tipoAct] = {};
        modTipoData[tipoAct][mod] = (modTipoData[tipoAct][mod] || 0) + 1; 

        totalInsc += insc;
        totalCert += cert;
        if (estado.includes("curso") || estado.includes("proceso")) enCurso++;
    });

    const labelsAños = Object.keys(años).sort();
    
    let acumAct = 0;
    const dataAcumActividades = labelsAños.map(a => { acumAct += años[a]; return acumAct; });

    const commonOptions = {
        responsive: true, maintainAspectRatio: true, aspectRatio: 2.2,
        scales: {
            x: { display: true, grid: { display: false }, ticks: { color: PALETTE.dark, font: { weight: '600' } } },
            y: { display: true, beginAtZero: true, grid: { color: '#e0e6ed' } }
        },
        plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 15 } } }
    };

    if(window.chartEf) window.chartEf.destroy();
    window.chartEf = new Chart(document.getElementById('chartEficacia'), {
        type: 'bar',
        data: {
            labels: labelsAños,
            datasets: [
                { label: 'Inscriptos', data: labelsAños.map(a => inscAño[a]), backgroundColor: EXTENDED_PALETTE[0], borderRadius: 4 },
                { label: 'Certificados', data: labelsAños.map(a => certAño[a]), backgroundColor: EXTENDED_PALETTE[2], borderRadius: 4 }
            ]
        },
        options: commonOptions
    });

    if(window.chartEv) window.chartEv.destroy();
    window.chartEv = new Chart(document.getElementById('chartCapacitaciones'), {
        type: 'line',
        data: {
            labels: labelsAños,
            datasets: [{
                label: 'Cantidad de actividades', data: dataAcumActividades,
                borderColor: PALETTE.orange, backgroundColor: PALETTE.orange + '22',
                fill: true, tension: 0.3, pointRadius: 4
            }]
        },
        options: commonOptions
    });

    const labelsTipoArr = Array.from(tiposActividad).sort();
    const labelsModArr = Array.from(modalidades).sort();

    const datasetsModalidad = labelsModArr.map((mod, index) => {
        return {
            label: mod,
            data: labelsTipoArr.map(tipo => {
                return (modTipoData[tipo] && modTipoData[tipo][mod]) ? modTipoData[tipo][mod] : 0;
            }),
            backgroundColor: EXTENDED_PALETTE[index % EXTENDED_PALETTE.length],
            borderRadius: 0
        };
    });

    if(window.chartModTipo) window.chartModTipo.destroy();
    window.chartModTipo = new Chart(document.getElementById('chartModalidadTipo'), {
        type: 'bar',
        data: { labels: labelsTipoArr, datasets: datasetsModalidad },
        options: {
            responsive: true, maintainAspectRatio: true, aspectRatio: 2.2, indexAxis: 'y',
            scales: {
                x: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#e0e6ed' } },
                y: { stacked: true, grid: { display: false }, ticks: { color: PALETTE.dark, font: { weight: '600' } } }
            },
            plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 15 } } }
        }
    });

    const arrayTipos = Array.from(tiposActividad);
    const datasetsApilados = arrayTipos.map((tipo, index) => {
        return {
            label: tipo,
            data: labelsAños.map(a => inscAñoTipo[a] ? (inscAñoTipo[a][tipo] || 0) : 0),
            backgroundColor: EXTENDED_PALETTE[(index + 3) % EXTENDED_PALETTE.length],
            borderRadius: 0 
        };
    });

    if(window.chartInscMod) window.chartInscMod.destroy();
    window.chartInscMod = new Chart(document.getElementById('chartInscModalidad'), {
        type: 'bar',
        data: { labels: labelsAños, datasets: datasetsApilados },
        options: {
            responsive: true, maintainAspectRatio: true, aspectRatio: 2.2,
            scales: {
                x: { stacked: true, grid: { display: false }, ticks: { color: PALETTE.dark, font: { weight: '600' } } },
                y: { stacked: true, beginAtZero: true, grid: { color: '#e0e6ed' } }
            },
            plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 15 } } }
        }
    });

    if(window.chartArt) window.chartArt.destroy();
    window.chartArt = new Chart(document.getElementById('chartArticulacion'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(artData),
            datasets: [{ 
                data: Object.values(artData), 
                backgroundColor: EXTENDED_PALETTE.slice(0, Object.keys(artData).length), 
                borderWidth: 0 
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: true, aspectRatio: 2.2, cutout: '65%',
            plugins: { legend: { position: 'right', labels: { usePointStyle: true } } }
        }
    });

    if(window.chartFin) window.chartFin.destroy();
    window.chartFin = new Chart(document.getElementById('chartFinanciamiento'), {
        type: 'pie',
        data: {
            labels: Object.keys(finData),
            datasets: [{ data: Object.values(finData), backgroundColor: [EXTENDED_PALETTE[1], EXTENDED_PALETTE[7]], borderWidth: 0 }]
        },
        options: {
            responsive: true, maintainAspectRatio: true, aspectRatio: 2.2,
            plugins: { legend: { position: 'right', labels: { usePointStyle: true } } }
        }
    });
}

function renderAsistenciasChart(data) {
    let total = data.length;
    let orgsCount = {};
    let temasCount = {};
    let modCount = {};
    let temporal = {};

    data.forEach(r => {
        const org = r.organismo_solicitante || 'S/D';
        const tema = r.tema || 'General';
        const mod = r.modalidad || 'S/D';
        const año = r.año || 'S/D';
        const est = norm(r.estado || 'pendiente');

        orgsCount[org] = (orgsCount[org] || 0) + 1;
        temasCount[tema] = (temasCount[tema] || 0) + 1;
        modCount[mod] = (modCount[mod] || 0) + 1;

        if(!temporal[año]) temporal[año] = { finalizada: 0, curso: 0, pendiente: 0, otros: 0 };
        
        if(est.includes('final')) temporal[año].finalizada++;
        else if(est.includes('curso') || est.includes('proceso')) temporal[año].curso++;
        else if(est.includes('pend')) temporal[año].pendiente++;
        else temporal[año].otros++;
    });

    document.getElementById('asis-total').innerText = total;
    document.getElementById('asis-orgs').innerText = Object.keys(orgsCount).length;
    document.getElementById('asis-temas').innerText = Object.keys(temasCount).length;

    let maxMod = 'S/D', maxVal = 0;
    for(let m in modCount) { if(modCount[m] > maxVal) { maxVal = modCount[m]; maxMod = m; } }
    document.getElementById('asis-mod').innerText = maxMod;

    const labelsAños = Object.keys(temporal).sort();
    if(window.chAsisTemp) window.chAsisTemp.destroy();
    window.chAsisTemp = new Chart(document.getElementById('chartAsisTemporal'), {
        type: 'bar',
        data: {
            labels: labelsAños,
            datasets: [
                { label: 'Finalizada', data: labelsAños.map(a => temporal[a].finalizada), backgroundColor: EXTENDED_PALETTE[2] },
                { label: 'En Curso', data: labelsAños.map(a => temporal[a].curso), backgroundColor: EXTENDED_PALETTE[4] },
                { label: 'Pendiente', data: labelsAños.map(a => temporal[a].pendiente), backgroundColor: EXTENDED_PALETTE[5] }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: true, aspectRatio: 2,
            scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true, ticks: {stepSize:1} } },
            plugins: { legend: { position: 'top', labels: { usePointStyle: true } } }
        }
    });

    const sortedOrgs = Object.entries(orgsCount).sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
    });
    let tableHTML = `<table class="custom-table">
        <thead><tr><th>Organismo</th><th class="text-center">Asistencias</th></tr></thead>
        <tbody>`;
    sortedOrgs.forEach(([org, count]) => {
        tableHTML += `<tr><td>${org}</td><td class="text-center"><strong>${count}</strong></td></tr>`;
    });
    tableHTML += `</tbody></table>`;
    document.getElementById('tableAsisOrgs').innerHTML = tableHTML;

    const topTemas = Object.entries(temasCount).sort((a,b) => b[1]-a[1]).slice(0, 6);
    if(window.chAsisTemas) window.chAsisTemas.destroy();
    window.chAsisTemas = new Chart(document.getElementById('chartAsisTemas'), {
        type: 'radar',
        data: {
            labels: topTemas.map(t => t[0]),
            datasets: [{
                label: 'Frecuencia de Temas',
                data: topTemas.map(t => t[1]),
                backgroundColor: PALETTE.blue + '44', 
                borderColor: PALETTE.blue,
                pointBackgroundColor: EXTENDED_PALETTE[3],
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: EXTENDED_PALETTE[3]
            }]
        },
        options: { 
            responsive: true, maintainAspectRatio: true, aspectRatio: 2,
            scales: { r: { beginAtZero: true, ticks: { display: false } } }, 
            plugins: { legend: { display: false } }
        }
    });

    if(window.chAsisMod) window.chAsisMod.destroy();
    window.chAsisMod = new Chart(document.getElementById('chartAsisModalidad'), {
        type: 'polarArea',
        data: {
            labels: Object.keys(modCount),
            datasets: [{ data: Object.values(modCount), backgroundColor: EXTENDED_PALETTE.slice(-Object.keys(modCount).length) }]
        },
        options: { 
            responsive: true, maintainAspectRatio: true, aspectRatio: 2, 
            scales: { r: { ticks: { display: false } } },
            plugins: { legend: { position: 'right', labels: { usePointStyle: true } } } 
        }
    });
}

function renderGlosarioRoles(data) {
    const grid = document.getElementById('roles-grid');
    grid.innerHTML = "";
    
    data.forEach(r => {
        const keyTerm = Object.keys(r).find(k => norm(k).includes('termino'));
        const keyDef = Object.keys(r).find(k => norm(k).includes('definicion'));
        if (r[keyTerm]) {
            grid.innerHTML += `
                <div class="def-item">
                    <strong>${r[keyTerm]}</strong>
                    <p style="margin-top: 8px;">${r[keyDef] || ''}</p>
                </div>`;
        }
    });
}

function renderInfografiaAsistencias(data) {
    let currentTipo = "";
    let grupos = {};

    data.forEach(r => {
        const keyTipo = Object.keys(r).find(k => norm(k).includes('tipo') && norm(k).includes('asistencia'));
        const keyAccion = Object.keys(r).find(k => norm(k).includes('acciones'));

        if(r[keyTipo] && r[keyTipo].trim() !== "") currentTipo = r[keyTipo];
        if(currentTipo && r[keyAccion]) {
            if(!grupos[currentTipo]) grupos[currentTipo] = [];
            grupos[currentTipo].push(r[keyAccion]);
        }
    });
    
    const grid = document.getElementById('acciones-grid');
    grid.innerHTML = "";

    for (const [tipo, acciones] of Object.entries(grupos)) {
        let lista = acciones.map(a => `<li style="margin-bottom: 5px;">${a}</li>`).join('');
        
        grid.innerHTML += `
            <div class="def-item" style="border-left-color: var(--c-blue);">
                <strong>${tipo}</strong>
                <ul style="margin-top: 8px; padding-left: 18px; color: #555; font-size: 0.9rem;">${lista}</ul>
            </div>`;
    }
}

function renderAdhesionesCharts(data) {
    let totalAdhesiones = data.length;
    let totalReps = 0;
    const añoCount = {};
    const orgReps = {};

    data.forEach(r => {
        const año = r.año_adhesion || 'S/D';
        const reps = Number(r.cant_representantes) || 0;
        const org = r.abreviatura || r.organismo || 'S/D';

        totalReps += reps;
        añoCount[año] = (añoCount[año] || 0) + 1;
        orgReps[org] = (orgReps[org] || 0) + reps;
    });

    document.getElementById('adh-total').innerText = totalAdhesiones;
    document.getElementById('adh-reps').innerText = totalReps;

    const labelsAños = Object.keys(añoCount).sort();
    let acumulado = 0;
    const dataAcumulada = labelsAños.map(a => { acumulado += añoCount[a]; return acumulado; });

    if(window.chartAdhEv) window.chartAdhEv.destroy();
    window.chartAdhEv = new Chart(document.getElementById('chartAdhesionesEv'), {
        type: 'line',
        data: {
            labels: labelsAños,
            datasets: [{
                label: 'Canitdad de organismos adheridos',
                data: dataAcumulada,
                borderColor: EXTENDED_PALETTE[2],
                backgroundColor: EXTENDED_PALETTE[2] + '22',
                fill: true, tension: 0.3, pointRadius: 5
            }]
        },
        options: { responsive: true, maintainAspectRatio: true, aspectRatio: 2.2, plugins: { legend: { position: 'top' } } }
    });

    const topOrgs = Object.entries(orgReps).sort((a,b) => b[1]-a[1]).slice(0, 10);
    if(window.chartAdhReps) window.chartAdhReps.destroy();
    window.chartAdhReps = new Chart(document.getElementById('chartAdhesionesReps'), {
        type: 'bar',
        data: {
            labels: topOrgs.map(o => o[0]),
            datasets: [{
                label: 'Cantidad de representantes',
                data: topOrgs.map(o => o[1]),
                backgroundColor: EXTENDED_PALETTE[4],
                borderRadius: 4
            }]
        },
        options: { 
            indexAxis: 'y', responsive: true, maintainAspectRatio: true, aspectRatio: 2.2,
            scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
            plugins: { legend: { position: 'top' } }
        }
    });
}

function renderComunicacionCharts(data) {
    let totalAcciones = data.length;
    const canalesCount = {};
    const tematicasCount = {};
    const tiposCount = {};
    const añosCount = {}; //
    const articulacionSet = new Set(); 
    
    data.forEach(r => {
        const canal = r.canal_de_difusion || 'S/D';
        const tipo = r.tipo_accion_comunicacional || r.tipo_accion_comunicacion || 'S/D';
        const tematica = r.tematica_ide || 'S/D';
        const art = r.articulacion ? r.articulacion.trim() : '';
        const año = r.año || 'S/D';

        canalesCount[canal] = (canalesCount[canal] || 0) + 1;
        tematicasCount[tematica] = (tematicasCount[tematica] || 0) + 1;
        tiposCount[tipo] = (tiposCount[tipo] || 0) + 1;
        añosCount[año] = (añosCount[año] || 0) + 1;

        if (art !== '' && norm(art) !== 's/d' && norm(art) !== 'no' && norm(art) !== 'ninguna') {
            articulacionSet.add(art);
        }
    });

    document.getElementById('com-total').innerText = totalAcciones;
    document.getElementById('com-canales').innerText = Object.keys(canalesCount).length;
    document.getElementById('com-tipos').innerText = Object.keys(tiposCount).length;
    document.getElementById('com-tematicas').innerText = Object.keys(tematicasCount).length;
    document.getElementById('com-articulacion').innerText = articulacionSet.size;

    if(window.chComCanal) window.chComCanal.destroy();
    window.chComCanal = new Chart(document.getElementById('chartComCanales'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(canalesCount),
            datasets: [{ data: Object.values(canalesCount), backgroundColor: EXTENDED_PALETTE, borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: true, aspectRatio: 2.2, cutout: '65%', plugins: { legend: { position: 'right', labels: { usePointStyle: true } } } }
    });

    let topTematicas = Object.entries(tematicasCount)
        .sort((a,b) => b[1]-a[1])
        .slice(0, 6);
    topTematicas = topTematicas.sort(() => Math.random() - 0.5);

    if(window.chComTematicas) window.chComTematicas.destroy();
    window.chComTematicas = new Chart(document.getElementById('chartComTematicas'), {
        type: 'radar',
        data: {
            labels: topTematicas.map(t => t[0]),
            datasets: [{
                label: 'Acciones Realizadas',
                data: topTematicas.map(t => t[1]),
                backgroundColor: PALETTE.blue + '44',
                borderColor: PALETTE.blue,
                pointBackgroundColor: EXTENDED_PALETTE[4],
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: EXTENDED_PALETTE[4]
            }]
        },
        options: { 
            responsive: true, maintainAspectRatio: true, aspectRatio: 2.2,
            scales: { r: { beginAtZero: true, ticks: { display: false } } },
            plugins: { legend: { display: false } }
        }
    });

    const arrayTipos = Object.keys(tiposCount).sort();
    const maxCount = Math.max(...arrayTipos.map(t => tiposCount[t]));
    const totalTipos = arrayTipos.length;
    
    const bubbleDatasets = arrayTipos.map((tipo, index) => {
        const count = tiposCount[tipo];
        const radius = maxCount === 0 ? 15 : 15 + ((count / maxCount) * 35);
        
        const angle = (index / totalTipos) * 2 * Math.PI;
        const distance = 15 + (Math.random() * 20); 
        
        const xPos = 50 + (distance * Math.cos(angle));
        const yPos = 50 + (distance * Math.sin(angle));

        return {
            label: `${tipo}`, 
            data: [{ x: xPos, y: yPos, r: radius, v: count }], 
            backgroundColor: EXTENDED_PALETTE[index % EXTENDED_PALETTE.length] + '99',
            borderColor: EXTENDED_PALETTE[index % EXTENDED_PALETTE.length],
            borderWidth: 2,
            hoverRadius: radius + 3
        };
    });

    if(window.chComTemp) window.chComTemp.destroy();
    window.chComTemp = new Chart(document.getElementById('chartComTemporal'), {
        type: 'bubble',
        data: { datasets: bubbleDatasets },
        options: { 
            responsive: true, maintainAspectRatio: true, aspectRatio: 2.2,
            scales: {
                x: { display: false, min: 0, max: 100 },
                y: { display: false, min: 0, max: 100 }
            },
            plugins: { 
                legend: { display: true, position: 'right', labels: { usePointStyle: true, padding: 10 } }, 
                tooltip: { callbacks: { label: function(c) { return `${c.dataset.label}: ${c.raw.v} acciones`; } } }
            }
        }
    });


    const labelsAnos = Object.keys(añosCount)
        .filter(a => norm(a) !== 's/d' && a !== '')
        .sort();

    if(window.chComAnual) window.chComAnual.destroy();
    window.chComAnual = new Chart(document.getElementById('chartComAnual'), {
        type: 'bar',
        data: {
            labels: labelsAnos,
            datasets: [{
                label: 'Acciones Realizadas',
                data: labelsAnos.map(a => añosCount[a]),
                backgroundColor: EXTENDED_PALETTE[6],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: true, aspectRatio: 2.2,
            scales: {
                x: { grid: { display: false }, ticks: { color: PALETTE.dark, font: { weight: '600' } } },
                y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#e0e6ed' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function initUIEventHandlers() {
    const btnToggle = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            
            setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 310);
        });
    }

    const expandButtons = document.querySelectorAll('.btn-expand');
    expandButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.glass-card');
            card.classList.toggle('fullscreen-mode');
            
            const icon = this.querySelector('i');
            if (card.classList.contains('fullscreen-mode')) {
                icon.classList.remove('fa-expand');
                icon.classList.add('fa-compress');
            } else {
                icon.classList.remove('fa-compress');
                icon.classList.add('fa-expand');
            }

            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 310);
        });
    });
}

window.onload = function() {
    initDashboard();
    initUIEventHandlers();
};