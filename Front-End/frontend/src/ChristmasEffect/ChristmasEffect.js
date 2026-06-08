import React from "react";
import "./ChristmasEffect.css";

export default function ChristmasEffect() {
  return (
    <>
      {/* Snow */}
      <div className="snow-container">
        {[...Array(120)].map((_, i) => (
          <div key={i} className="snow" />
        ))}
      </div>

      {/* Three Christmas Cables */}
      <div className="lights-wrap">

        {/* Cable 1 */}
        <div className="cable cable-1">
          <svg className="cable-line" viewBox="0 0 100 20">
            <path d="M0 10 Q50 0 100 10" stroke="#555" strokeWidth="2" fill="none" />
          </svg>
          <div className="bulbs">
            {[...Array(20)].map((_, i) => <div key={i} className="bulb" />)}
          </div>
        </div>

        {/* Cable 2 */}
        <div className="cable cable-2">
          <svg className="cable-line" viewBox="0 0 100 20">
            <path d="M0 12 Q50 4 100 12" stroke="#555" strokeWidth="2" fill="none" />
          </svg>
          <div className="bulbs">
            {[...Array(20)].map((_, i) => <div key={i} className="bulb" />)}
          </div>
        </div>

        {/* Cable 3 */}
        <div className="cable cable-3">
          <svg className="cable-line" viewBox="0 0 100 20">
            <path d="M0 14 Q50 6 100 14" stroke="#555" strokeWidth="2" fill="none" />
          </svg>
          <div className="bulbs">
            {[...Array(20)].map((_, i) => <div key={i} className="bulb" />)}
          </div>
        </div>

      </div>
    </>
  );
}
