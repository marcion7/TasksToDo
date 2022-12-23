import React from "react";

export const language = {
  pl: {
    AddTask: 'Nowe zadanie',
    EditTask: 'Edytuj zadanie',
  },
  en: {
    AddTask: 'Add Task',
    EditTask: 'Edit Task',
  },
};

// set the defaults
const LanguageContext = React.createContext({
    language: "pl",
    setLanguage: () => {}
  });
