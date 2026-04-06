export default function QuickGuide() {
  return (
    <section className="setup-section quick-guide">
      <div className="guide-header">
        <div>
          <h2>📘 Quick Guide</h2>
          <p className="guide-subtitle">Fast reminders to keep setups balanced.</p>
        </div>
      </div>

      <div className="guide-grid">
        <div className="guide-card">
          <h3>Balance tips</h3>
          <ul className="guide-list">
            <li>Start near 1 wolf for 4–5 players; add a wolf sooner if you run many info roles.</li>
            <li>Keep at least as many plain Villagers as special roles so the village still needs deduction.</li>
            <li>Introduce only 1–2 swingy roles (Raven, Fox, Cupid) at a time to avoid chaos.</li>
          </ul>
        </div>

        <div className="guide-card">
          <h3>Role difficulty</h3>
          <div className="guide-tags">
            <div className="guide-tag soft">
              Beginner friendly: Seer, Protector, Witch, Hunter, Mayor / Captain
            </div>
            <div className="guide-tag spicy">
              Advanced / swingy: Little Girl, Big Bad Wolf, Infect Père des Loups, Village Idiot,
              Scapegoat, Bear Tamer, Raven, Fox, Cupid
            </div>
          </div>
        </div>
      </div>

      <div className="guide-card ratio-card">
        <h3>Suggested wolf count</h3>
        <ul className="ratio-list">
          <li>5–6 players: 1 wolf (light pressure)</li>
          <li>7–9 players: 2 wolves</li>
          <li>10–12 players: 3 wolves</li>
          <li>13–16 players: 4 wolves</li>
          <li>17–20 players: 4–5 wolves depending on how many chaotic roles you add</li>
        </ul>
      </div>
    </section>
  );
}
