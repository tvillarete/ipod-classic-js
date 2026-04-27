export default function OfflinePage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#000",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
        iPod.js
      </h1>
      <p style={{ fontSize: "1rem", opacity: 0.7 }}>
        You&apos;re offline. Connect to the internet to start listening.
      </p>
    </div>
  );
}
