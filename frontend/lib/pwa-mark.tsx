export function PwaMark({ size }: { size: number }) {
  const ring = Math.round(size * 0.18);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f6f1e6",
        color: "#1b2a4a",
        fontSize: Math.round(size * 0.46),
        fontFamily: "Georgia",
      }}
    >
      <div style={{ display: "flex", marginTop: Math.round(size * 0.06) }}>N</div>
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: Math.round(size * 0.2),
          left: Math.round(size * 0.56),
          width: ring,
          height: ring,
          borderRadius: ring,
          border: `${Math.max(2, Math.round(size * 0.018))}px solid #a9b4ee`,
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: Math.round(size * 0.16),
          left: Math.round(size * 0.46),
          width: ring,
          height: ring,
          borderRadius: ring,
          border: `${Math.max(2, Math.round(size * 0.018))}px solid #8e97d8`,
        }}
      />
    </div>
  );
}
