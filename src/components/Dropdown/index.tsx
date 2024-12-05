// components/DropDownCard.js
import { useState } from "react";

const Dropdown = () => {
  // Estado para controlar o toggle (abrir/fechar)
  const [isOpen, setIsOpen] = useState(false);

  // Função para alternar o estado do card
  const toggleCard = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className=" flex-col-reverse px-52">
      <div
        className=" rounded-2xl shadow-xl bg-[#ECEFF5] py-8 px-96 "
        onClick={toggleCard}
      >
        <span className=" px-96  ">{isOpen ? "▼" : " ▲"}</span>
      </div>
    </div>
  );
};

export default Dropdown;
