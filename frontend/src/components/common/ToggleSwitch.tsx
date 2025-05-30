import React from "react";
import "./ToggleSwitch.css";

interface ToggleSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  label,
  checked,
  onChange,
  className = "",
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <div className={`toggle-switch-container ${className}`}>
      <label htmlFor={id} className="toggle-switch-label">
        {label}
      </label>
      <label className="toggle-switch-control">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={handleChange}
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
};

export default ToggleSwitch;
