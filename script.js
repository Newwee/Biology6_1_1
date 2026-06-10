const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const body = document.body;
const themeBtn = $('#themeBtn');
const progress = $('#readingProgress');
const toTopBtn = $('#toTopBtn');
const expandAllBtn = $('#expandAllBtn');
const searchInput = $('#searchInput');

const savedTheme = localStorage.getItem('neuroTheme');
if (savedTheme) {
  body.dataset.theme = savedTheme;
  themeBtn.textContent = savedTheme === 'light' ? '☀️' : '🌙';
}

themeBtn.addEventListener('click', () => {
  const next = body.dataset.theme === 'light' ? 'dark' : 'light';
  if (next === 'dark') {
    body.removeAttribute('data-theme');
    localStorage.setItem('neuroTheme', 'dark');
    themeBtn.textContent = '🌙';
  } else {
    body.dataset.theme = 'light';
    localStorage.setItem('neuroTheme', 'light');
    themeBtn.textContent = '☀️';
  }
});

window.addEventListener('scroll', () => {
  const doc = document.documentElement;
  const maxScroll = doc.scrollHeight - doc.clientHeight;
  const pct = maxScroll > 0 ? (doc.scrollTop / maxScroll) * 100 : 0;
  progress.style.width = `${pct}%`;
  toTopBtn.classList.toggle('show', window.scrollY > 540);
});

toTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

let detailsOpen = true;
expandAllBtn.addEventListener('click', () => {
  detailsOpen = !detailsOpen;
  $$('details').forEach(d => d.open = !detailsOpen);
  expandAllBtn.textContent = detailsOpen ? 'เปิดสรุปทั้งหมด' : 'ปิดสรุปทั้งหมด';
});

// Search sections and cards
let noResultBox = null;
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  const sections = $$('.section');
  let visible = 0;

  if (noResultBox) noResultBox.remove();

  sections.forEach(section => {
    const text = `${section.textContent} ${section.dataset.search || ''}`.toLowerCase();
    const match = !q || text.includes(q);
    section.classList.toggle('hidden-by-search', !match);
    if (match) visible += 1;
  });

  if (q && visible === 0) {
    noResultBox = document.createElement('div');
    noResultBox.className = 'no-results';
    noResultBox.textContent = `ไม่พบคำว่า "${searchInput.value}" ลองค้นคำอื่น เช่น RMP, Na+, Synapse, GABA`;
    $('.tools-panel').insertAdjacentElement('afterend', noResultBox);
  }
});

// Flashcards
const flashcards = [
  {
    q: 'RMP คืออะไร?',
    a: 'Resting membrane potential คือศักย์เยื่อเซลล์ขณะพัก ประมาณ -70 mV ภายในเซลล์ลบกว่าภายนอก'
  },
  {
    q: 'Na+ / K+ pump ทำอะไร?',
    a: 'ใช้ ATP ปั๊ม Na+ ออก 3 ตัว และ K+ เข้า 2 ตัว เพื่อช่วยรักษาความต่างศักย์เยื่อเซลล์'
  },
  {
    q: 'Depolarization เกิดจากอะไร?',
    a: 'Voltage-gated Na+ channel เปิด ทำให้ Na+ ไหลเข้าเซลล์ ศักย์เยื่อเซลล์เป็นบวกมากขึ้น'
  },
  {
    q: 'Repolarization เกิดจากอะไร?',
    a: 'Voltage-gated K+ channel เปิด ทำให้ K+ ออกจากเซลล์ ศักย์เยื่อเซลล์กลับลงมาใกล้ RMP'
  },
  {
    q: 'All-or-none response หมายถึงอะไร?',
    a: 'ถ้ากระตุ้นถึง threshold จะเกิด action potential เต็มที่ แต่ถ้าไม่ถึงจะไม่เกิด ไม่ได้เกิดครึ่ง ๆ กลาง ๆ'
  },
  {
    q: 'Saltatory conduction เร็วเพราะอะไร?',
    a: 'กระแสประสาทกระโดดจาก node of Ranvier ไปยัง node ถัดไปใน axon ที่มี myelin จึงเร็วกว่าแบบต่อเนื่อง'
  },
  {
    q: 'Electrical synapse ต่างจาก chemical synapse ยังไง?',
    a: 'Electrical ใช้ gap junction ส่งกระแสตรง ส่วน chemical มี synaptic cleft และใช้ neurotransmitter ส่งสัญญาณ'
  },
  {
    q: 'Botulinum toxin ทำให้กล้ามเนื้ออ่อนแรงได้อย่างไร?',
    a: 'ยับยั้งการหลั่ง acetylcholine ทำให้สัญญาณประสาทไปกระตุ้นกล้ามเนื้อไม่ได้ตามปกติ'
  }
];

let flashIndex = 0;
const flashcard = $('#flashcard');
const flashQuestion = $('#flashQuestion');
const flashAnswer = $('#flashAnswer');

function renderFlashcard() {
  flashcard.classList.remove('flipped');
  flashQuestion.textContent = flashcards[flashIndex].q;
  flashAnswer.textContent = flashcards[flashIndex].a;
}

function flipFlashcard() {
  flashcard.classList.toggle('flipped');
}

$('#nextFlash').addEventListener('click', () => {
  flashIndex = (flashIndex + 1) % flashcards.length;
  renderFlashcard();
});

$('#prevFlash').addEventListener('click', () => {
  flashIndex = (flashIndex - 1 + flashcards.length) % flashcards.length;
  renderFlashcard();
});

flashcard.addEventListener('click', flipFlashcard);
flashcard.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'Enter') {
    e.preventDefault();
    flipFlashcard();
  }
});

renderFlashcard();

// Quiz
const quiz = [
  {
    q: 'โครงสร้างใดอยู่ใน CNS?',
    choices: ['เส้นประสาทสมอง', 'สมองและไขสันหลัง', 'Ganglia นอก CNS', 'Schwann cell'],
    answer: 1,
    explain: 'CNS ประกอบด้วยสมองและไขสันหลัง'
  },
  {
    q: 'Afferent neuron ทำหน้าที่อะไร?',
    choices: ['ส่งคำสั่งออกจาก CNS', 'รับข้อมูลเข้าสู่ CNS', 'สร้าง myelin ใน PNS', 'หลั่ง neurotransmitter เท่านั้น'],
    answer: 1,
    explain: 'Afferent = sensory input เข้าสู่ CNS'
  },
  {
    q: 'ค่าประมาณของ resting membrane potential คือข้อใด?',
    choices: ['+30 mV', '0 mV', '-70 mV', '-120 mV'],
    answer: 2,
    explain: 'RMP ของ neuron ประมาณ -70 mV'
  },
  {
    q: 'Na+ / K+ pump ปั๊มไอออนแบบใด?',
    choices: ['Na+ เข้า 3, K+ ออก 2', 'Na+ ออก 3, K+ เข้า 2', 'Na+ ออก 2, K+ เข้า 3', 'Cl- ออก 3, Na+ เข้า 2'],
    answer: 1,
    explain: 'ปั๊ม Na+ ออก 3 ตัว และ K+ เข้า 2 ตัว'
  },
  {
    q: 'ช่วง depolarization ส่วนใหญ่เกิดจากอะไร?',
    choices: ['K+ ออกจากเซลล์', 'Na+ เข้าสู่เซลล์', 'Cl- ออกจากเซลล์', 'Ca2+ ออกจากเซลล์ประสาททั้งหมด'],
    answer: 1,
    explain: 'Na+ ไหลเข้า ทำให้ภายในเซลล์เป็นบวกมากขึ้น'
  },
  {
    q: 'ข้อใดอธิบาย all-or-none response ได้ถูกต้อง?',
    choices: ['กระตุ้นแรงขึ้น AP จะสูงขึ้นเรื่อย ๆ', 'ถ้าถึง threshold จะเกิด AP เต็มที่', 'AP เกิดได้โดยไม่ต้องถึง threshold', 'เกิดเฉพาะใน synapse ไฟฟ้า'],
    answer: 1,
    explain: 'ถึง threshold = เกิดเต็มที่ ไม่ถึง = ไม่เกิด'
  },
  {
    q: 'เซลล์ใดสร้าง myelin ใน PNS?',
    choices: ['Astrocyte', 'Oligodendrocyte', 'Schwann cell', 'Microglia'],
    answer: 2,
    explain: 'Schwann cell สร้าง myelin ใน PNS ส่วน oligodendrocyte สร้างใน CNS'
  },
  {
    q: 'Chemical synapse ต้องใช้สิ่งใดในการส่งสัญญาณ?',
    choices: ['Gap junction เท่านั้น', 'Neurotransmitter', 'Ribosome', 'DNA polymerase'],
    answer: 1,
    explain: 'chemical synapse ใช้ neurotransmitter แพร่ผ่าน synaptic cleft'
  },
  {
    q: 'สารสื่อประสาทใดเป็น inhibitory neurotransmitter สำคัญใน CNS?',
    choices: ['Glutamate', 'GABA', 'Acetylcholine', 'Epinephrine'],
    answer: 1,
    explain: 'GABA เป็นสารสื่อประสาทชนิดยับยั้งสำคัญใน CNS'
  },
  {
    q: 'Botulinum toxin ส่งผลอย่างไร?',
    choices: ['เพิ่มการหลั่ง dopamine', 'ยับยั้งการหลั่ง acetylcholine', 'เปิด K+ channel ตลอดเวลา', 'ทำให้ myelin หนาขึ้น'],
    answer: 1,
    explain: 'พิษ botulinum ยับยั้งการหลั่ง ACh ทำให้กล้ามเนื้ออ่อนแรง/อัมพาตได้'
  }
];

const quizArea = $('#quizArea');
const scoreBox = $('#scoreBox');

function renderQuiz() {
  quizArea.innerHTML = quiz.map((item, idx) => `
    <div class="quiz-question" data-index="${idx}">
      <h3>${idx + 1}. ${item.q}</h3>
      <div class="options">
        ${item.choices.map((choice, cidx) => `
          <label>
            <input type="radio" name="q${idx}" value="${cidx}" />
            <span>${choice}</span>
          </label>
        `).join('')}
      </div>
      <p class="explain" hidden>${item.explain}</p>
    </div>
  `).join('');
  scoreBox.style.display = 'none';
  scoreBox.textContent = '';
}

function checkQuiz() {
  let score = 0;
  $$('.quiz-question').forEach((questionEl, idx) => {
    const selected = $(`input[name="q${idx}"]:checked`, questionEl);
    const labels = $$('label', questionEl);
    labels.forEach(label => label.classList.remove('correct', 'wrong'));

    const correct = quiz[idx].answer;
    labels[correct].classList.add('correct');

    if (selected) {
      const selectedValue = Number(selected.value);
      if (selectedValue === correct) {
        score += 1;
      } else {
        labels[selectedValue].classList.add('wrong');
      }
    }

    const explain = $('.explain', questionEl);
    explain.hidden = false;
    explain.style.color = 'var(--muted)';
    explain.style.margin = '10px 0 0';
  });

  let message = 'ทบทวนอีกนิด แล้วลองทำใหม่ได้เลย';
  if (score >= 9) message = 'โคตรดี! พร้อมสอบหัวข้อนี้แล้ว';
  else if (score >= 7) message = 'ดีมาก เหลือเก็บรายละเอียดอีกนิด';
  else if (score >= 5) message = 'พอใช้ได้ แนะนำอ่าน Action Potential กับ Synapse ซ้ำ';

  scoreBox.style.display = 'block';
  scoreBox.textContent = `คะแนน ${score}/${quiz.length} — ${message}`;
  scoreBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

$('#checkQuizBtn').addEventListener('click', checkQuiz);
$('#resetQuizBtn').addEventListener('click', renderQuiz);
renderQuiz();

// keyboard shortcut: / focuses search
window.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
  }
});
