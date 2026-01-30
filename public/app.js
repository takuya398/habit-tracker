async function api(path, opts){
  const res = await fetch(path, opts);
  return res.json();
}

async function load(){
  const list = document.getElementById('list');
  list.textContent = '読み込み中…';
  const habits = await api('/api/habits');
  if(!habits || habits.length===0){ list.innerHTML = '<p>習慣がありません。</p>'; return; }
  list.innerHTML = '';
  habits.forEach(h => {
    const el = document.createElement('div'); el.className = 'habit';
    const left = document.createElement('div'); left.textContent = h.name;
    const right = document.createElement('div');
    const btn = document.createElement('button'); btn.textContent = 'チェックイン';
    btn.onclick = async () => { await api(`/api/habits/${h.id}/checkin`, { method: 'POST' }); alert('チェックインしました'); };
    const statBtn = document.createElement('button'); statBtn.textContent = '回数';
    statBtn.style.marginLeft = '8px';
    statBtn.onclick = async () => { const s = await api(`/api/stats/${h.id}`); alert(`合計 ${s.count} 回`); };
    right.appendChild(btn); right.appendChild(statBtn);
    el.appendChild(left); el.appendChild(right);
    list.appendChild(el);
  });
}

document.getElementById('addForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  if(!name) return;
  await api('/api/habits', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name }) });
  document.getElementById('name').value = '';
  load();
});

load();
