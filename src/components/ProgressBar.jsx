import React from 'react';
export default function ProgressBar({ value = 0 }){
  const v = Math.max(0, Math.min(100, value));
  return <div className="progress"><div style={{width: v+'%'}}/></div>
}
