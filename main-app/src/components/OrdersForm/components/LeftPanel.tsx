interface LeftPanelProps {
  pages: string[];
  onSelectPage: (page: string) => void;
}

function LeftPanel({ pages, onSelectPage }: LeftPanelProps) {
  return (
    <div style={{ 
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh', 
      width: 'min(256px, 25vw)', // Use the smaller of 256px or 25% of viewport width
      backgroundColor: '#1f2937', 
      color: 'white', 
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 10,
      overflow: 'auto' // Add scrolling if content doesn't fit
    }}>
      <h2 style={{ 
        fontSize: 'min(1.25rem, 4vw)', // Responsive font size
        fontWeight: 'bold', 
        marginBottom: '16px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        Navigation
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {pages.map((page, index) => (
          <button
            key={index}
            style={{ 
              padding: '8px', 
              backgroundColor: '#374151', 
              borderRadius: '4px',
              textAlign: 'left',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: 'min(1rem, 3.5vw)', // Responsive font size
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            onClick={() => onSelectPage(page)}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            title={page} // Add tooltip for truncated text
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}

export default LeftPanel;