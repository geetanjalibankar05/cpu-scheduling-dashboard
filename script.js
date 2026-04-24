document.getElementById("algo").addEventListener("change", function () {
    if (this.value === "rr") {
        document.getElementById("quantumDiv").style.display = "block";
    } else {
        document.getElementById("quantumDiv").style.display = "none";
    }
});

function generateInputs() {
    let n = document.getElementById("num").value;
    let div = document.getElementById("inputs");
    div.innerHTML = "";

    for (let i = 0; i < n; i++) {
        div.innerHTML += `
            <p>P${i+1}:
            AT <input id="at${i}" type="number">
            BT <input id="bt${i}" type="number"></p>
        `;
    }
}

function fcfs(p) {
    p.sort((a,b) => a.at - b.at);
    let time = 0;

    p.forEach(proc => {
        if (time < proc.at) time = proc.at;
        time += proc.bt;
        proc.ct = time;
        proc.tat = proc.ct - proc.at;
        proc.wt = proc.tat - proc.bt;
    });

    return p;
}

function sjf(p) {
    let n = p.length;
    let done = Array(n).fill(false);
    let time = 0, completed = 0;

    while (completed < n) {
        let idx = -1, min = Infinity;

        for (let i = 0; i < n; i++) {
            if (!done[i] && p[i].at <= time && p[i].bt < min) {
                min = p[i].bt;
                idx = i;
            }
        }

        if (idx === -1) {
            time++;
            continue;
        }

        time += p[idx].bt;
        p[idx].ct = time;
        p[idx].tat = p[idx].ct - p[idx].at;
        p[idx].wt = p[idx].tat - p[idx].bt;

        done[idx] = true;
        completed++;
    }

    return p;
}

function roundRobin(p, q) {
    let n = p.length;
    let rem = p.map(x => x.bt);
    let time = 0;
    let queue = [0];

    while (queue.length) {
        let i = queue.shift();

        if (rem[i] > q) {
            time += q;
            rem[i] -= q;
            queue.push(i);
        } else {
            time += rem[i];
            rem[i] = 0;
            p[i].ct = time;
            p[i].tat = time - p[i].at;
            p[i].wt = p[i].tat - p[i].bt;
        }

        for (let j = 0; j < n; j++) {
            if (rem[j] > 0 && !queue.includes(j)) {
                queue.push(j);
            }
        }
    }

    return p;
}

function runSimulation() {
    let n = document.getElementById("num").value;
    let algo = document.getElementById("algo").value;

    let p = [];

    for (let i = 0; i < n; i++) {
        p.push({
            pid: i+1,
            at: +document.getElementById(`at${i}`).value,
            bt: +document.getElementById(`bt${i}`).value
        });
    }

    let result;

    if (algo === "fcfs") result = fcfs([...p]);
    else if (algo === "sjf") result = sjf([...p]);
    else {
        let q = +document.getElementById("quantum").value;
        result = roundRobin([...p], q);
    }

    displayTable(result);
    drawCharts(result);
}

function displayTable(p) {
    let table = document.getElementById("resultTable");

    table.innerHTML = `
        <tr>
            <th>PID</th><th>AT</th><th>BT</th>
            <th>CT</th><th>TAT</th><th>WT</th>
        </tr>
    `;

    p.forEach(proc => {
        table.innerHTML += `
            <tr>
                <td>P${proc.pid}</td>
                <td>${proc.at}</td>
                <td>${proc.bt}</td>
                <td>${proc.ct}</td>
                <td>${proc.tat}</td>
                <td>${proc.wt}</td>
            </tr>
        `;
    });
}

let wtChart, tatChart;

function drawCharts(p) {
    let labels = p.map(x => "P"+x.pid);
    let wt = p.map(x => x.wt);
    let tat = p.map(x => x.tat);

    if (wtChart) wtChart.destroy();
    if (tatChart) tatChart.destroy();

   wtChart = new Chart(document.getElementById("wtChart"), {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [{ label: "Waiting Time", data: wt }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

tatChart = new Chart(document.getElementById("tatChart"), {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [{ label: "Turnaround Time", data: tat }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});
}
