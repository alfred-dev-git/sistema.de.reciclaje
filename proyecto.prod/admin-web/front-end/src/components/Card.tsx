
export default function Card({ title, children, isHome }: { title?: string; children: React.ReactNode; isHome?: boolean }) {
  return (
    <div className={`card ${isHome ? 'card-home' : ''}`}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}
