import {createContext} from 'preact';
import {useState} from 'preact/hooks';

import {Modal} from '../components/modal.jsx';

export const ModalContext = createContext(null);

export const ModalContextProvider = ({ children }) => {
  const [options, setOptions] = useState();

  const show = (params) => {
    setOptions({
      title: params.title,
      message: params.message,
      confirmText: params.confirmText,
      rejectText: params.rejectText,
      onConfirm: params.onConfirm,
      onReject: params.onReject,
    });
  };

  const dismiss = () => {
    setOptions();
  };

  return (
    <ModalContext.Provider value={{ show, dismiss }}>
      {children}
      {options && (
        <Modal
          {...options}
        />
      )}
    </ModalContext.Provider>
  );
};
