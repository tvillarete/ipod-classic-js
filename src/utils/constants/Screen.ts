const XS = {
  MediaQuery: '@media (min-width: 0)',
  Size: {
    Min: 0,
    Max: 575,
  },
  ContainerMaxWidth: '100%',
};

const SM = {
  MediaQuery: '@media (max-width: 576px)',
  Size: {
    Min: 576,
    Max: 767,
  },
  ContainerMaxWidth: '540px',
};

const MD = {
  MediaQuery: '@media (min-width: 768px)',
  Size: {
    Min: 768,
    Max: 991,
  },
  ContainerMaxWidth: '720px',
};

const LG = {
  MediaQuery: '@media (min-width: 992px)',
  Size: {
    Min: 992,
    Max: 1199,
  },
  ContainerMaxWidth: '960px',
};

const XL = {
  MediaQuery: '@media (min-width: 1200px)',
  Size: {
    Min: 1200,
    Max: null,
  },
  ContainerMaxWidth: '1140px',
};

const Screen = {
  XS,
  SM,
  MD,
  LG,
  XL,
};

export default Screen;
