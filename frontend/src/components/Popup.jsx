import React from "react";
import PopupSidebar from "./PopupBox";
import MainPopupBox from "./MainPopupBox";

const renderContent = {
  1: <MainPopupBox text="Bine ai venit la VisioScience3D!" />,
  2: (
    <PopupSidebar
      text="Învață matematica prin vizualizarea formelor geometrice!"
      link="/math"
      buttonText="Intră"
    />
  ),
  3: (
    <PopupSidebar
      text="Învață fizica prin vizualizarea fenomenelor în 3D!"
      link="/physics"
      buttonText="Intră"
    />
  ),
  4: (
    <PopupSidebar
      text="Vezi formulele chimice în 3D!"
      link="/chemistry"
      buttonText="Intră"
    />
  ),
  5: (
    <PopupSidebar
      text="Explorează Sistemul Solar din browserul tău!"
      link="/astronomy"
      buttonText="Intră"
    />
  ),
  6: <PopupSidebar 
    text="Explorează structuri de date în 3D!"
    link="/computer-science"
    buttonText="Intră" />,
  7: <PopupSidebar text="În curând..." link="#" buttonText="..." />,
};

const Popup = ({ currentStage }) => {
  return renderContent[currentStage] || null;
};

export default Popup;
