function Graph() {
  return (
    <section className="card">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Trends</p>
          <h1>Graph</h1>
          <p className="muted">
            Visualize detection density, severity distribution, and response
            velocity over time.
          </p>
        </div>
        <span className="pill">Last 30 days</span>
      </div>
      <div className="panel tall">
        <p className="muted">Charts will render here once data is connected.</p>
        <div className="placeholder">Graph canvas</div>
      </div>
    </section>
  );
}

export default Graph;
