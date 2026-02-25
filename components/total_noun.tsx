


type StatsProps = {
    current: number;
    total: number;
  };
  
  export default function Stats({ current, total }: StatsProps) {
    return (
      <div style={{ marginBottom: "20px", fontWeight: "bold" }}>
        📊 {current} / {total} words
  
        <div
          style={{
            height: "8px",
            background: "#eee",
            borderRadius: "5px",
            marginTop: "5px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(current / total) * 100}%`,
              height: "100%",
              background: "#4CAF50",
            }}
          />
        </div>
      </div>
    );
  }
  