function Home() {
    return (
        <div className="flex items-center justify-center" style={{ 
            height: 'calc(100vh - 160px)', 
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 0
        }}>
            <h1 className="text-center text-2xl font-semibold">Welcome to the Home Page</h1>
        </div>
    )
}

export default Home;