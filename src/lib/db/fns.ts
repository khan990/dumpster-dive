export const oneSec = function(fn: any) {
  setTimeout(fn, 1000);
};

//add a comma to large numbers
export const niceNumber = (x: any) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

//logger of rough-time since an epoch
export const timeSince = function(start: any) {
  const ms = Date.now() - start;
  if (ms < 1000) {
    return ms + 'ms';
  }
  const seconds = ms / 1000;
  if (seconds < 60) {
    return parseInt(seconds as any, 10) + 's';
  }
  const minutes = seconds / 60;
  let duration = minutes.toFixed(1) + ' minutes';
  if (minutes > 120) {
    const hours = minutes / 60;
    duration = hours.toFixed(1) + ' hours';
  }
  return duration;
};

export const alignRight = function(str: any) {
  return ('      ' + str).slice(-13);
};

export const niceTime = function(mins: any) {
  if (mins <= 60) {
    return mins.toFixed(1) + ' mins';
  }
  const hours = mins / 60;
  return hours.toFixed(1) + ' hrs';
};
