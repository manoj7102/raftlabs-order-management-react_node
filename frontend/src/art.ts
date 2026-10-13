type Dish =
  | "pizza"
  | "burger"
  | "pasta"
  | "tacos"
  | "salad"
  | "dessert"
  | "bowl";

const common = `
  <defs>
    <radialGradient id="back"><stop stop-color="#fffaf0"/><stop offset="1" stop-color="#f4e7d5"/></radialGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="12"/></filter>
  </defs>
  <rect width="480" height="480" rx="44" fill="url(#back)"/>
  <circle cx="392" cy="78" r="48" fill="#e9dfc9" opacity=".5"/>
  <circle cx="67" cy="400" r="72" fill="#dfe5cf" opacity=".54"/>
  <ellipse cx="240" cy="369" rx="165" ry="29" fill="#b49773" opacity=".23" filter="url(#soft)"/>
`;

const food: Record<Dish, string> = {
  pizza: `
    <circle cx="240" cy="235" r="163" fill="#fffdf6"/><circle cx="240" cy="235" r="149" fill="#e7dfcf"/>
    <circle cx="240" cy="226" r="129" fill="#c17a3f"/><circle cx="240" cy="226" r="114" fill="#eeb457"/>
    <circle cx="240" cy="226" r="104" fill="#f6d681"/>
    <g fill="#c94e3c"><circle cx="184" cy="174" r="20"/><circle cx="278" cy="162" r="22"/><circle cx="314" cy="242" r="18"/><circle cx="245" cy="281" r="19"/><circle cx="154" cy="268" r="18"/><circle cx="210" cy="225" r="16"/></g>
    <g fill="#527d4a"><ellipse cx="241" cy="144" rx="10" ry="20" transform="rotate(28 241 144)"/><ellipse cx="327" cy="204" rx="9" ry="19" transform="rotate(-42 327 204)"/><ellipse cx="181" cy="312" rx="10" ry="20" transform="rotate(24 181 312)"/><ellipse cx="274" cy="244" rx="9" ry="19" transform="rotate(53 274 244)"/></g>
    <g fill="#fff4cc" opacity=".86"><circle cx="173" cy="212" r="8"/><circle cx="284" cy="300" r="8"/><circle cx="294" cy="192" r="7"/></g>
  `,
  burger: `
    <ellipse cx="240" cy="340" rx="164" ry="42" fill="#fffdf6"/><ellipse cx="240" cy="335" rx="145" ry="28" fill="#eae2d3"/>
    <path d="M129 309Q240 335 351 309L339 334Q240 357 141 334Z" fill="#cc8547"/>
    <path d="M127 292Q240 309 353 292L345 319Q240 339 135 319Z" fill="#6e3b27"/>
    <path d="M125 278Q160 267 185 283Q214 266 239 282Q271 265 298 281Q326 266 355 280L350 296Q238 310 130 296Z" fill="#6a9856"/>
    <path d="M131 265Q240 282 348 265L336 284Q242 298 143 284Z" fill="#f3c453"/>
    <path d="M134 254Q240 267 347 254L341 271Q238 285 140 271Z" fill="#db6550"/>
    <path d="M128 245C129 180 176 133 240 133S351 180 352 245Q240 264 128 245Z" fill="#e5a354"/>
    <path d="M145 223C155 174 193 151 240 151S325 174 335 223Q239 237 145 223Z" fill="#efb96b"/>
    <g fill="#fff0c4"><ellipse cx="190" cy="185" rx="5" ry="2" transform="rotate(-25 190 185)"/><ellipse cx="235" cy="174" rx="5" ry="2" transform="rotate(26 235 174)"/><ellipse cx="278" cy="189" rx="5" ry="2" transform="rotate(-20 278 189)"/><ellipse cx="206" cy="213" rx="5" ry="2" transform="rotate(25 206 213)"/><ellipse cx="294" cy="218" rx="5" ry="2" transform="rotate(23 294 218)"/></g>
  `,
  pasta: `
    <ellipse cx="240" cy="272" rx="163" ry="105" fill="#fffdf6"/><ellipse cx="240" cy="255" rx="142" ry="83" fill="#e8e0d1"/><ellipse cx="240" cy="249" rx="128" ry="70" fill="#f7e2a0"/>
    <g fill="none" stroke="#e6ad54" stroke-width="16" stroke-linecap="round"><path d="M133 242C176 184 222 290 264 221S334 207 341 242"/><path d="M135 268C185 321 209 181 266 262S326 283 345 244"/><path d="M166 204C213 274 237 195 292 212S329 276 289 281"/><path d="M171 277C203 222 229 292 284 242S317 207 325 230"/></g>
    <g fill="#c9503d"><circle cx="176" cy="222" r="16"/><circle cx="283" cy="205" r="14"/><circle cx="316" cy="260" r="15"/><circle cx="215" cy="282" r="13"/></g>
    <g fill="#5f8e56"><ellipse cx="202" cy="215" rx="9" ry="17" transform="rotate(-28 202 215)"/><ellipse cx="274" cy="273" rx="9" ry="18" transform="rotate(34 274 273)"/><ellipse cx="245" cy="181" rx="8" ry="16" transform="rotate(31 245 181)"/></g>
  `,
  tacos: `
    <ellipse cx="240" cy="340" rx="169" ry="38" fill="#fffdf6"/><ellipse cx="240" cy="338" rx="145" ry="24" fill="#e9e1d4"/>
    <path d="M96 296Q123 176 209 168Q229 181 241 214Q188 221 142 309Z" fill="#e5ad62" stroke="#cf904b" stroke-width="6"/>
    <path d="M218 306Q247 180 334 170Q365 197 383 270Q324 281 266 323Z" fill="#eab86f" stroke="#cf904b" stroke-width="6"/>
    <path d="M122 269Q164 188 218 202Q238 229 227 255Q181 235 145 294Z" fill="#624230"/><path d="M243 274Q276 192 342 203Q361 222 365 252Q311 240 267 299Z" fill="#654331"/>
    <g fill="#62945b"><path d="M118 246Q139 194 171 222Q194 182 222 215L209 255Q157 232 130 275Z"/><path d="M241 242Q258 186 295 216Q322 184 351 216L358 256Q304 235 253 275Z"/></g>
    <g fill="#d85d47"><circle cx="163" cy="248" r="11"/><circle cx="193" cy="231" r="9"/><circle cx="278" cy="249" r="10"/><circle cx="324" cy="232" r="11"/></g>
  `,
  salad: `
    <ellipse cx="240" cy="248" rx="162" ry="112" fill="#fffdf6"/><ellipse cx="240" cy="240" rx="140" ry="91" fill="#dbe7c9"/>
    <g fill="#649452"><ellipse cx="172" cy="204" rx="51" ry="31" transform="rotate(-32 172 204)"/><ellipse cx="261" cy="188" rx="53" ry="29" transform="rotate(39 261 188)"/><ellipse cx="315" cy="244" rx="48" ry="28" transform="rotate(-28 315 244)"/><ellipse cx="190" cy="276" rx="50" ry="30" transform="rotate(25 190 276)"/><ellipse cx="254" cy="270" rx="45" ry="28" transform="rotate(-16 254 270)"/></g>
    <g fill="#85ad63"><ellipse cx="142" cy="241" rx="27" ry="39" transform="rotate(22 142 241)"/><ellipse cx="232" cy="212" rx="26" ry="40" transform="rotate(-18 232 212)"/><ellipse cx="294" cy="284" rx="31" ry="39" transform="rotate(22 294 284)"/></g>
    <g fill="#e36c4a"><circle cx="181" cy="213" r="19"/><circle cx="295" cy="215" r="19"/><circle cx="218" cy="288" r="17"/></g>
    <g fill="#f1d475"><circle cx="245" cy="242" r="13"/><circle cx="158" cy="274" r="12"/><circle cx="327" cy="270" r="11"/></g>
  `,
  dessert: `
    <ellipse cx="240" cy="333" rx="170" ry="44" fill="#fffdf6"/><ellipse cx="240" cy="328" rx="149" ry="29" fill="#e9e0d1"/>
    <path d="M110 218L240 163L369 218L369 294L240 344L110 294Z" fill="#693d32"/>
    <path d="M110 218L240 163L369 218L240 269Z" fill="#85503d"/>
    <path d="M240 269L369 218L369 294L240 344Z" fill="#5e352d"/>
    <path d="M110 218L240 163L369 218L240 269Z" fill="#92563e"/>
    <path d="M128 218L240 173L350 218L240 257Z" fill="#a86c4c"/>
    <path d="M132 209Q186 213 240 180Q288 209 347 210" fill="none" stroke="#4e2b27" stroke-width="15" stroke-linecap="round"/>
    <g fill="#e2b87d"><circle cx="181" cy="210" r="8"/><circle cx="270" cy="209" r="7"/><circle cx="218" cy="231" r="6"/></g>
    <circle cx="279" cy="150" r="27" fill="#ce574b"/><path d="M280 130Q274 115 285 111" fill="none" stroke="#537b4a" stroke-width="7" stroke-linecap="round"/>
  `,
  bowl: `
    <ellipse cx="240" cy="247" rx="163" ry="112" fill="#fffdf6"/><ellipse cx="240" cy="237" rx="143" ry="90" fill="#e4dccc"/>
    <ellipse cx="240" cy="234" rx="130" ry="78" fill="#e6c08c"/>
    <path d="M116 218Q184 155 241 215Q185 249 137 278Q117 256 116 218Z" fill="#7a9d55"/>
    <path d="M242 159Q333 149 365 220Q327 250 255 244Z" fill="#d57546"/>
    <path d="M140 281Q197 236 255 245Q300 272 324 290Q231 328 140 281Z" fill="#f3d58a"/>
    <g fill="#6a8e4f"><ellipse cx="172" cy="206" rx="18" ry="9" transform="rotate(40 172 206)"/><ellipse cx="203" cy="188" rx="18" ry="9" transform="rotate(-35 203 188)"/><ellipse cx="293" cy="194" rx="17" ry="8" transform="rotate(30 293 194)"/></g>
    <g fill="#fff1bf"><circle cx="246" cy="281" r="8"/><circle cx="216" cy="270" r="7"/><circle cx="267" cy="260" r="7"/></g>
  `,
};

function dishFor(name: string): Dish {
  const value = name.toLowerCase();
  if (value.includes("pizza")) return "pizza";
  if (value.includes("burger")) return "burger";
  if (value.includes("pasta")) return "pasta";
  if (value.includes("taco")) return "tacos";
  if (value.includes("salad")) return "salad";
  if (
    value.includes("brownie") ||
    value.includes("dessert") ||
    value.includes("cake")
  )
    return "dessert";
  return "bowl";
}

const artwork = Object.fromEntries(
  (Object.keys(food) as Dish[]).map((dish) => [
    dish,
    `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480">${common}${food[dish]}</svg>`)}`,
  ]),
) as Record<Dish, string>;

export function fallbackArt(name: string): string {
  return artwork[dishFor(name)];
}
