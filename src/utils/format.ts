// Pomocné funkce pro formátování údajů z JSON dat.

// 2490 -> "2 490 Kč"
export function formatPrice(price: number): string {
	return new Intl.NumberFormat('cs-CZ', {
		style: 'currency',
		currency: 'CZK',
		maximumFractionDigits: 0,
	}).format(price);
}
