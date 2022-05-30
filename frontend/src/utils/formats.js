export const FORMATS = {
  AGILE: 'agile',
  MAD_SAD_GLAD: 'madSadGlad',
  FOUR_LS: 'fourLs',
  START_STOP_CONTINUE: 'startStopContinue',
  DROP_ADD_KEEP_IMPROVE: 'dropAddKeepImprove',
};

const RED = 'rgb(251, 180, 175)';
const BLUE = 'rgb(166, 213, 250)';
const GREEN = 'rgb(183, 223, 185)';
const YELLOW = 'rgb(255, 214, 153)';

const AGILE = [{
  title: 'What went well?',
  color: GREEN
}, {
  title: 'What went less well?',
  color: RED
}, {
  title: 'What do we want to try next?',
  color: BLUE
}, {
  title: 'What puzzles us?',
  color: YELLOW
}];

const MAD_SAD_GLAD = [{
  title: 'Mad',
  color: RED
}, {
  title: 'Sad',
  color: YELLOW
}, {
  title: 'Glad',
  color: GREEN
}];

const FOUR_LS = [{
  title: 'Liked',
  color: GREEN
}, {
  title: 'Learned',
  color: YELLOW
}, {
  title: 'Lacked',
  color: RED
}, {
  title: 'Longed for',
  color: BLUE
}];

const START_STOP_CONTINUE = [{
  title: 'Start',
  color: GREEN
}, {
  title: 'Stop',
  color: RED
}, {
  title: 'Continue',
  color: YELLOW
}];

const DROP_ADD_KEEP_IMPROVE = [{
  title: 'Drop',
  color: YELLOW
}, {
  title: 'Add',
  color: GREEN
},{
  title: 'Keep',
  color: BLUE
}, {
  title: 'Improve',
  color: RED
}];

export const FORMAT_COLUMNS = {
  [FORMATS.AGILE]: AGILE,
  [FORMATS.MAD_SAD_GLAD]: MAD_SAD_GLAD,
  [FORMATS.FOUR_LS]: FOUR_LS,
  [FORMATS.START_STOP_CONTINUE]: START_STOP_CONTINUE,
  [FORMATS.DROP_ADD_KEEP_IMPROVE]: DROP_ADD_KEEP_IMPROVE,
};

export const FORMAT_NAMES = {
  [FORMATS.AGILE]: 'Agile',
  [FORMATS.MAD_SAD_GLAD]: 'Mad Sad Glad',
  [FORMATS.FOUR_LS]: 'Four Ls',
  [FORMATS.START_STOP_CONTINUE]: 'Start Stop Continue',
  [FORMATS.DROP_ADD_KEEP_IMPROVE]: 'Drop Add Keep Improve',
}

