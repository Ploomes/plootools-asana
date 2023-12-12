export function isReadyDetails(wrapperDetails: HTMLElement, callback: (isLoaded: boolean) => void, numAttempts = 0) {
  numAttempts += 1;
  const details = wrapperDetails.querySelector('.FocusTrap');
  if(numAttempts < 3) {
    isReadyDetails(wrapperDetails, callback, numAttempts);
  }else {
    callback(!!details);
  }
}