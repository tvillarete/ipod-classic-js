import React from 'react';

import ViewOptions, { AboutView } from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import { useMenuHideWindow, useScrollHandler } from 'hooks';

const SettingsView = () => {
  useMenuHideWindow(ViewOptions.settings.id);
  const options: SelectableListOption[] = [
    {
      label: "About",
      value: () => <AboutView />,
      viewId: ViewOptions.about.id
    }
  ];

  const [index] = useScrollHandler(ViewOptions.settings.id, options);

  return <SelectableList options={options} activeIndex={index} />;
};

export default SettingsView;
