// components/SetuLogo.jsx
// Vector SETU wordmark: sharp at any size. Colour follows text colour (currentColor).
export default function SetuLogo({ className = "h-7 w-auto", title = "SETU" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1430 390" role="img" aria-label={title} className={className}>
      <g fill="none" stroke="currentColor" strokeWidth="38" strokeLinejoin="miter" strokeLinecap="butt">
        <path d="M 270 150 C 258 116 218 100 165 100 C 100 100 60 125 60 160 C 60 200 110 206 165 211 C 225 218 272 232 272 262 C 272 295 230 310 165 310 C 110 310 66 296 56 262" />
        <path d="M 605 108 H 407 V 250 C 407 290 435 308 480 308 H 590 C 680 308 700 250 730 190 C 760 130 790 108 850 108 H 989 V 222" />
        <path d="M 407 205 H 572" />
        <path d="M 1128 95 V 235 C 1128 290 1160 312 1240 312 C 1320 312 1346 290 1346 235 V 95" />
      </g>
    </svg>
  );
}
