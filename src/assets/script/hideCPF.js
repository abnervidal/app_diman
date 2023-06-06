export default function hideSSN(ssn) {
  // Define a regular expression to match the parts of the SSN to be masked
  const regex = /(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/;

  // Use the replace() method to apply the regular expression and replace the matched parts with asterisks
  const maskedSSN = ssn.replace(regex, '$1.***.***-$4');

  // Return the masked SSN
  return maskedSSN;
}
