/**
 * Card Component
 * Reusable card component for content containers
 */

export default function Card({ children, className = '', title = null }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      )}
      {children}
    </div>
  )
}

