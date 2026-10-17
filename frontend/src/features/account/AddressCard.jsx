import { countryName } from './countries';

// How an address is printed everywhere (account page, checkout, order page).
export function AddressLines({ address }) {
  return (
    <div className="text-sm leading-relaxed text-slate-700">
      <p className="font-medium text-slate-900">{address.fullName}</p>
      <p>{address.line1}</p>
      {address.line2 && <p>{address.line2}</p>}
      <p>
        {address.city}, {address.state} {address.postalCode}
      </p>
      <p>{countryName(address.country)}</p>
      <p className="text-slate-500">{address.phone}</p>
    </div>
  );
}
