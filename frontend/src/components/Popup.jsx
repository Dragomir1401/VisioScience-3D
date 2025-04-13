import React from "react";
import PopupBox from "./PopupBox";
import MainPopupBox from "./MainPopupBox";

const renderContent = {
  1: <MainPopupBox text="Bine ai venit la VisioScience3D!" />,
  2: (
    <PopupBox
      text="Învață matematica prin vizualizarea formelor geometrice!"
      link="/math"
      buttonText="Intră"
    />
  ),
  3: (
    <PopupBox
      text="Învață fizica prin vizualizarea fenomenelor în 3D!"
      link="/physics"
      buttonText="Intră"
    />
  ),
  4: (
    <PopupBox
      text="Vezi formulele chimice în 3D!"
      link="/chemistry"
      buttonText="Intră"
    />
  ),
  5: (
    <PopupBox
      text="Explorează Sistemul Solar din browserul tău!"
      link="/astronomy"
      buttonText="Intră"
    />
  ),
  6: <PopupBox text="În curând..." link="#" buttonText="..." />,
  7: <PopupBox text="În curând..." link="#" buttonText="..." />,
};

const Popup = ({ currentStage }) => {
  return renderContent[currentStage] || null;
};

export default Popup;
