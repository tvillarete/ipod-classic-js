import { useState, useRef, useEffect } from "react";

const useStateRef = <TType>(initialValue: TType) => {
  const [value, setValue] = useState<TType>(initialValue);

  const ref = useRef<TType>(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return [value, setValue, ref];
};

export default useStateRef;
