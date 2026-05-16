export default function SectionLabel({ children, className = '' }) {
  return (
    <span className={`text-[0.72rem] tracking-[0.22em] text-gold uppercase font-medium block mb-3 ${className}`}>
      {children}
    </span>
  )
}
