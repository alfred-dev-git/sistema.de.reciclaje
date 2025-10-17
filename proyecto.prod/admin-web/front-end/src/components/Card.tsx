import './card.css';

export default function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="card">
      {title && <h3>{title}</h3>}
      <div>{children}</div>
    </div>
  );
}
