export default function StatsCard({ icon: Icon, value, label, colorClass }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon-wrapper ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div className="stat-info">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
}
