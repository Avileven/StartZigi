// api/send-welcome/route-early-adopter.js
// [EARLY ADOPTER] Welcome email for launch period — includes Early Adopter badge and Builder upgrade message.
// Switch back to route.js after the launch window closes.

import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const BADGE_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAB4CAYAAADfRGj6AAAABmJLR0QA/wD/AP+gvaeTAAAgAElEQVR4nO2dd5QcxbWHvw6TZ3NQRBmFVUaLUEACARJBIKIBYcBgm2BjsA0Gx8cDPweCgWM/wIYHPOIj52CJIARCQqCAcs4raYM27+TQ9f7YNDM7szuzOyutpPrO2SNNd3V1dfr17Vv3VoFEIpFIeiRKVzYWa3FgYhoKxcAIoB/gBEzpaJxEIpEcRfhRqEVQgsIaDL5SitjQlQpTFmgh0NjChcB1wNmAuSsNkEgkkmOYXcBzhHhCGUt5qhsnLdBCoLCFa4E/AMNS3ZFEIpEcx/iBRwnyZ2UcNclulJRAi62MJMzTwLREZUJhhfIqnQa3RiDYJc+JRCKRHHWYTYKsjDB98oOJCylUILhJKeKdZOrsUEnFRq4CnqDRt9y6XMDKTQ4+XJLFsjUOtu21EgxJYZZIJMc3GY4wk0Z5OHtaPRefUUuGIxyv2H9Twe3KLELt1dWuoooN3AXcF1nOMODtz7N57NUCtu6xdqb9EolEclzgsBlcM7ea266qIMvZRqgX4uMSpRhPou0TCrTYwF0I7o9ctn2fhdsf6s/qLfautVoikUiOI/KyQvz11oPMnVEXu+pzGpirTMMbb7u4Ai3WcRXwYuT6977I4vaH++Pxqelqs0QikRxX/PiiSv7zpjI0VbQuFLygjOfaeOXbCLRYx0gEK4jwOb/wUS6/fbQfhtENLZZIJJLjiLmn1vH4b0ow6REirXCrMo5HY8tGmcNCoGDwNAInAhCNlrMUZ4lEIkkPH37V6I1o1lgEYPCw+K5tlFy0v2IN1xIRSre9xMLtj/SX4iyRSCRp5M1F2Tz9bl7kIhMKjwsRrcktLg7xGhonsoWmJBTDgAt/NYRVskNQIpFI0o5JF7xx325OLooK4rhOmchzzT9a1XooFyIY1mxyv704W4qzRCKRdBPBkMJvHu2LESbS3fFfYhm25jJ6RPkf0OSzFgIefb2gUzu1mg369wqSlxPCbhFomuh4I4lEIjkKCYUVXB6VimqdA+UmwkZqyXqb91h5/bMcrjirJfv7BCxcAzwJTS4OsRYHQappGvhoxWY7F941JKUd2awG44d7GXJCAFUR+PwqHp8q074lEskxi8UscNgMzCaDQFBl7VYb2/ZaECnYpX3ygix/altkVMc3SjFToNmCDjCNiFHpPvgqK6VG9soLMfMkF7om2Lrbws4SC7UNWkp1SCQSydGIokCv3CBFQ32cPNrNgN4BvljlTNo4La0y8emKDM6dUt+8aLJYTV/lJA42CrSgOHKDZevtQHKvgF55Ic6c3ECDR2Pxygwa3M1ubenakEgkxz5CQFmVTlmVk8H9AkwZ62bO1Ho+/jojaZH+cGkm557SItAKQc4Cnm9UU8GIZid1KKSwrcSSVKU2q8HMiS4a3BoLlkaKs0QikRx/7D5gZtG3GWTYw0yf4EZJ0sO7dL0jOi4aJkBrJ2Gf5oJl1XrSqj9umA9dE3y+MnlzXiKRSI5lyqp0Vmy0c8oYD4P6Bti1v+M5TcqqdGoaNHIyWgZUOhGaw+wEGc3K3eBOzndstRgMPcHP1r1WaTlLJBJJBNv3Wais1Zkw3IuapDweqtEjregcaBVoc/OKYJKWcP+CIIqAnSVyxiuJRCKJZf0OK3aLQe/cdgbwj8DnVyMF2gqtAh3r/+iQvOwwvoBCrUtGa0gkEkkspZUmQmGFvoXJCXQ8HdajVkaVah+7JYzboyZVViKRSI43DAMa3AoOa3OqYEeI1mJNjoxGgTaiyySDrglCcWdykUgkEglAIKhg1pMU1UjbOMqCFjGFJBKJRHJ4ieO8kAItkUgkPYGEAt3ZyiQSiUSSmC7qpLSgJRKJpCfQrgUdOYdhEkMxNRdJpqxEIpEcj6Ssk+mK4pCWtkQikXRAKjopozgkEomkh5LWKA4p5BKJRNI+nbWgm5AWtEQikfQEku0kTDotMemyEolEcjySok6mrZNQ0mPRM/ycfpqLacMD9MsOY1UVfG6NA3ttfLkkgy9K1HYus2DMhWXcNSVMR+MaVn9dwB3vWQgl0SYl18XvflHLSE3nvcd78fqB5McPHzSnnHtmBYkdlksYCp4Gnd077CxY5GRtdXt1pum4lBDn3lTOVQPbeVCCNh77Ux7LA4mLmMdV8c/5Pta+3Jd/rEvuXJiy/Zw23cUpJwbon2NgU8Hr0tm728aSpU6WHWjvukp6PAk7CTtbmaTHoWR4ufGn1ZxiMrH82ww+K9XwCkF2gZ+pU1z8cKSPwqcLeW1vIlFQOLA2i2fLWi+w3s/F/OIQJSuyWHywdTt/uU6yw7H0m+BmmKLiDoWYelKAdw5YSHKMr0YMjVWLMllT37pI0Qxy+/iYNqGO208M8OQ/81ham6iCdB2XxoYvs/nfjDh7cPg49wwv2eVmDiTz1kqB7BG1/PJKF4NVja2bbCxcpeM2BDm9fRSPreemsR7Gv1HAv9ZqUfaW5AgjE1UkkfSZ1MDJmRqfPFXAi7sjRdjOF+tM3HlrLXNmeVj4nIO6BNe6Zo+dRXtaf5vH+biiOETFdgeLNnRi5hw9wIyJQcI7s3kjUM81Yz2MXmhhTTsWZhuEyu4NDhaXx67I4JPt1fzpKg8XTA6y/GNTQnFNy3EJhZJNDkpilythpl9VT0HQwsuvOSlJo0qqBS5+Mt/FALedJ57NYemhyLZm8PbnHn70wxqmXVTNlpICFlWnb9+Sw4jsJDzWEWRnhdEMnYOVbQUnXOXg0YdtBF0a/sN4nc2D3UzJVdj0uY1lgQCXjvZy6sgs1q5Lzyd5/Q4re0MeRuWGUEks0N2HoM+Uaq4pEqx5K5ePD6Vz+jdB0fQGRpp0Pn87VpwbCVbbee41wb4Cjc2eNO5acnhJRqCF0Zr90m5dTRaCTCTsSSgcPGjCr/mZPdvDpvftlAai1zfUpT7BQuRQ4Slfb8Vg/CQv2T4rL23ScIftrHJ5OGWil8x1DmqTuddE67/x9m8qCFKoQU2dRlgkb2N06bgi99+vgRvP9uNdm8czqxrbkPS+6WDfWoBxJ4YRlRl8sVNJWNaz18GHe1NpteRwkIpOCgMZxXGsU7M6k5dHVHFNcTX3ja1j104Lm3db2LLLwpZSjUCnLlfnr7Xi9DJjhEH9BjtrvAIws2S9xozJbk7JsbMwqc9xAYqCxRYmwxFRt2qQ09fH+XNd9AmYeWmliXDKgaeR/6aOYvHzve/VM6jewd/es1KbtNInt2/FEqJ3JoS2mDhgyGft6ONIRXHIe6VnEjLx2Yu92DTczayTvEwc5uGCIg/zAF+tmW++zuDtZVYq09yJlYiCcW5GmzU+X2XBD4DCju/slE5tYMaEIJ8sMiXXqaUGmXdzKfNilwuoP2jj5WezWViR5sZ3hGIw/vwa5uSZ+PB/stjg7YZ9aAILEPQpbc6TyR4myxK9TARUqtzpdLFIuoRM9Za0QSiUbnXyf1ud/J8iyCwIMmKIj8knuzn13CqKCvO4+00rDd19rdUg004KoNc4WFspyHA07bDOwuqKBs6b4GHQF1nsSsZpbGh8+XYOy2qafithTp5bwyyzg8eezGajv7sOIjG542v50SSDHQvyeGdf94iiCCp4BZhtBjpERL4IRsyp4NdTjKiwQd/aXH7ysi21CBlJz0B2Eh6HCIX6CjMrKsysWGFn2/UVXDvexeSFVj5r6N5d6yd4OLUPqKqbu37vblvA8DJjYCa7diUhbkKlfJ+FDRFRHLsX+JlwrZv5M+zc+6n5sIqSlu/mhnle9G3Z/M9Xpu7bd8DE/mqY2DfAIN3O5pYvH4V93+TwyDbRKNBqiJkX1jO6u9oh6X7SOmC/pOdhDlE02kdfl43Ptmtt37VhnW37NIzBBhl2oFsFWlA0yUuhYeLfr2SxNja6wOzn4isbmDzJz6u7rPg6sQf31kze3e7l+lPrmbUmn48r09HuJNCDzP1eHaODNh5/00F5dwYeGzqrt+icP9PLWaMz2bK2NfKlvtTK6tKmH1qAkechBfoYQwValTuOgicklbKSw4MIM+XsOq69uJ5JcRIpMAWZNDyM6tMpSZjQkR4Um48ZY8IEdjv4aL2FDTti/jY7WbRdIbPIw0R7J3ciNL5c6GSv7ueiczxkHxbXq2D47Bou6q+y+K1svunmrxBQ2PVVJitdBpMvqOb8gUacTEhB9gAfQ+zIZ7Kn0RlNjdimC1EcnSkr6VaCZt7+wEbRFW5+9vMgq9ZY2Vqu4TEEzpwgY8Z5GZ+vsOadDNamHAid2hs5a7SbCTaF9asSRDYIhe9WW3EV+ZgxJsTyb+NY/EnsP1Tq4PXVHu4oruN7Iyw8tSXV2OrUjssypI6bTg1AhZ3KXA9nTY1frna3nZVlSqeOqU2pBitPv5CB85oGLr+xnFM2W/muRKc+CPasEIMG+xh7gkHooJ2nP7UQlM9kD0SOxSEBajbkcE+1hbNP9TCxyMX4KQKzAt4GnX377PzvW06+3KMlNX5Gp1FCTJnkx+q2sWRzYsH0bLOzot7LjIleClc4Ke/MvSdU1n2WwdqxNUw/18XinZls70ZntKNXkDwN9D4eLr8wUVaIwpb3rawsSz3mPBGefRk88HcL06a5mTHKx5wRBlYU3C6N/ftsvLXEzpKNJhpknvfRS5woDgVAvM1KYBLA2r1W5vxlQId1zR7X2OnzyTpHByUlEonk+CQVnfz4d/sYP7ClN2aVcjHFMopDIpFIegLJhtkllQwVkX4rkUgkkjikopPthtmJdkq1t2dpckskEkkCUtFJ0aaTUO2GFkkkEokkDcgoDolEIukJpHUsDinkEolE0j6dHSypCRnFIZFIJD2Bo0Ggi0d3ZlQGiUQi6TorN1qP3M6Ti+Jo8yNBZd0VxSFNeIlEcqRIs/6kqpM9PdX7iL7BJBKJ5EghOwklEonkMJKWTsLYcil4OGQmoUQikcSnqzqpx24sBVcikUgOP/FmrW8U6MhCh7FBEolEImkk3iAbLT7oqKE4khlEPM7/JBKJRNJKSjoZYUE3z5qjQ48K4pBIJJLjkjhBHBEuDhG9QiKRSCSHD0GEDzoyDrpTUXZSySUSiaRdUtHJhD5oEeHjkMIrkUgkh5+oKI7YWb07M8ezRCKRSBLTWV2N7iRsEwctZ1SRSCSSrpO8TkZa0FGdhPEKdliZkXxZiUQiOR7pqk7KTEKJRCLpAaQ1k1Dq+NGEwRU37uWxMa1XLXgghzMfzGGT0c5mxzWCi364h6cmtJ6zUFk259yfy5rwEWyW5Kiii2MlSQvaPPoQm25sIFvpuGx77Fvcl1PeshJMT7MkLQimXlrCO6eF0KIWKyx6ZQBXfK1JY0FyTJDQgoZY5U7GoX2sdBKmq/3x3n89hUTt6qntjcDk5bLxMeIMoAimF7votzyT/d1yGEfxOUuCE2aWsvxSHxYFypf2ZuKrNgJHulHHIKnqZGwUhwqNqd7N6n1s3H6SYwXHcDfnZcVfZx7sZl7e4W3PMYES4vyJfsxd/GqUpJfmTEIhWoffkKPZxaG+wsrKqtTu3opyFenOTTcGp0/ykNd8KYRCeb1KflYYDVA0PxdPDPLEJyakWzh5tAI3Fw0USH3uWaQ1k/DYFXKFHcvzmf+pfOiPNIrDy6Wjw42feYAIW/jXhyZunN9AHwVQBGMnuRn5WTYb5dsxaYZOcDMuboCtJN2k1EmYKJNQWtCHAXOImZMauHScj0l9g/TPMLCr4PVq7Cu3sGyDg+e/drDR3U4VYw6x5QYXmc2mT8jOz/7Qi1f8IWbNruY/pnsZlWmglGVz1gM5bEjhDaNkuHjp7kPMsbQuc28sYNKTTioT3BSmwdUs+3kdg5sVFIX1H/XlrAXmtLzc8ka7OCNiisrgfjsffWdm2AUNfD+jcZney8VF/bLYWJKaPag5/Vx6Wj3zx/oYWxDGqShUV5v5ZoOTJz938nVdZzvMBX0Gu7mi2MPpQwIMzw2RYxGIsEpNrc7WEitfrHfy6loLZaF2qlGD3PbLA9w9sLUR9St6MfIFOwE9xMxpdVw/0cvJfUPkm8Hj0tmww8ELn2Xx5v62X3NqTj1v/0cV0+MIc6/pZRyc3vj/cFUW8/6UyzcJLmBuXzfzp7qZfaKfkblhss0Q9quUlFtYttHJc0vtrHUlvhbdeQ8f7bQ7HnRUKUlayRtay2PX1nJmTtvPSocjxKghIUYNcfOD06088lwhD2xPEJkQUPAAmS0LDDKtBpPPLOeFswJYmypv77lPhHDZeXmDxlmTWi1W+zA3ZzicvOaKuwWjirycoEYsCZl5c1V6xBklzLmTvDgi3Bsb1tnZ49dYsEVj/slN7dSCXDgpwIMllqQ7uZwn1PHUjTWcmRV5PQSFhT4uOMPHeZNdPPhUIdua+mSSlX4t08dtV1Zy++ggttiNVINeBQF6FQSYeVI9d1Ta+dtL+Ty6U4vvGhMqLn/0IqvdICPTy89vrODmAQYRp57MrCDTJtUydbyLc17rzU+Wm9Lb6acHueTSQ9w/1U+OGrPKFmbYIA/DBnn4/mlW/vVSIX/cqMW/D7rxHj7qiaPQatt14jj7a+9Mdf3P3LeW52+q4awYcRYCwrEhNZk+7vhxBT8uNOLWJUIK/shtFIPMPg38/rTWGzvxMXSwXih8+o2dsgi1UMw+5o4Mo8Q7NjXI7NHBqFTUwB4H71am57ypOS4uO7H1nImwmQ/W6YRRWLLWRk3EIQ0c76JYT65eJdPN335cHSPO0WhOH3deV8Uce0fnNKK9WW4evq2M342JI85xsOd7+I+flnJfUSj++UUQiFUpc4AfXd1WnCNR9BDzLi/n90PCcepMhjht0YJcdV0p/5wWLc4irFLtUvFF3DOa08dPf1jG3cPi3zddu4eP/b/YKxV3LA45aSzpiWhRQlxxYR2TIz7TRdDMMy/mc986M9UYjDmpmv+Z72J4k9KpNh+3z/Hy8gt2GmLbFFZirBLBpOkNnGIGIRRqa3RqhEFe07PZbny7aHutPdudvFXl4mcFTQsVgxnjvGSudFAbs72W42F2n8gdKCxd4aDESMN5AwaMd1McEVsX3G/ng0ON7W3YYuczl4vLm9wcWq6bS4bmsHRLR8oomDa7motzoq1ib4WDh97P5N/7VcgKcN7ptdw+3s3lcaJH4j4fapDrr6lkfmGE6AuF0h0ZPLLYzopDGjiCTC+u4xdT/eQ3iZxiCnLd1VV8e18hr9fF7kkhFGNamwbX83NN4Cl18PdPnSytUHEWeJk/u56L+hgt+1b0ID+a5+LZv2eyq6mOcE0G199jx6IHuPPnFVyb01pv5bcFzHnfQhAQhkpVKPoaDp5eyZ/HhtFa3pYaSz/O4xef2NnlB7PTz5UXV/KXkxtfToopwI1X1PLh/bl8E5MY0JV7+GgkFZ1MOBZH5LZH+flIA4Jh0yp5Y2SyH7YKlWtz+MmX5jafZWq2h8uGGVFiUPVdNveuNtPoalbZ8G0ufxzh5fnJra6FvCIPk012Pou9uWNvWDXIGUUQLHVy67O5vHGw0feoqKB0ptMsZOHVFSZuOjeAqanRGSM8zLI6eNsbXbRPkZexkdaU38br69OUNKI2ui3MEe6N9Wvt7Gk+Jr+VdzdrXNZ8zpQwc4u93L3FTjsufLB6+UFxdEy14bLz68cKeKm6aUGliS27rOy9/iD/mhhOyr2RNaaOX50YbdWWr8/jvGec7GtRIxPrdtj4orKcj+b5yGiqWHV6uXOWn/fesRDl0RDRhhOAogvUigyu/XseXzQf6B4LizZbcN1RzjX5EYc60MUVfTP46/6mHQmFqjodtDDumHsjHFAprdXju0RMXn56Zmt7ASq/y+WHH9pb+iYCLgvP/18huYUH+cOgxpeUqdDFLROy+HZF9D3R7ffwUUy875xOZxIey0Keme9nZn7H5Zo5UJYV90E2XA5++aAVc8sSBZ9LjxERlQ37TIQmh1vKqdYQgxxAbQc7VkANWbj/mTxeK4vwpnbBit2ywsnKOdVMbbLoFauXuSMM3l4TIT9KmDPGRsfR1m5y8HFcX3Xq6H3cXNIv2r3x3trIqBqVJd/ZqD7ZRX5TobzRbmbZ7HzgbVtfM5ZBXmbEuC32rczkjeqYgkLjnY8yuWVcDePbZMjEoIQ5e6qnpR0AImjh8XcixbmlMJsWZ/PyqWXc2BK/LRh0kpviDyws7cjxKlQ+XZDNlzFvIeGy8dBiK5c3JZ4AoAWZOTzM/fv1LoV/WoZ6mJsduTONBd/Y23Ych028vNzKXQO9jW1QDE6b4CN7pSPKHdWGbriHexKpHEO8rzO1uZJUPVWSJAhq7Cw1s7nlz8TuhrZS7g0o0eddEdiSDIPybMngpfL0RbQaVQ5e2aq2tkcxOH28j4zI5jm8nD048nNe4+MVtjZukM4hGHuSmxGR7o19Dj6sjC7l3hb9QlAdXi4tMtq1ePv1D5AT1RGgsnxrjOXaRPiQjc8OJXFetQAzB0XvN1RqZ2FVgvIhC59ui+4Y1DJ9nJKEQSBCFj7cHP8r5eBWG1ujlFhwYr8Apo6rbZehg/3kRh5cWGdbgvNSfdDMwYjG2Qf6GNvRC47038NHK/F0uDXVO8WH62j3DR1OzJl+Lpru4sKRPsb0ClNoMzCpyUcHJEZh+25LmoSxCaHxwbc27ilyt4hZ1kgPMyx2PmpSsszhXqa2fhZg1Nt5Y2uibqsU0QNcOjGi81EofLfWzt7YYwxYeW+jxpVTmt0cBrOKPeStThQWKOiTE47uXDN0diVKSArrbDsEonf710nNDjLEGr3MU25iX0KzVWFXuU6YiLaoIYbkCyhr/44I15jZmuALIVylszsM4yIE0Z4ZJlOBQ52+PwQn5IeixyTW/fzx7j38MYmtVXuQYQ74so1/PZJuuId7EJ3VVSVyTsK2s3qnZJin1oIeR2z7FVa/14dzUs5Oi3ceBAMn1vD8VQ2MscZZ3Yn6YimrVQl3eA0SrY+/vHaDgw/q3VzT1EmmOrycf6LBRxsUQDB1jDfKJ7l/jZ2lwfTcB5YhLi6ISt9WyBlZw+P945QtiD4C53A352Y4eKE+Xs0ChzUm+kGo1PsSt7vO23i8sfVEolrDbQbaqvcoGO1ckwZvTJyyIsi2GRDVurbbC7dKTaxjumWlQn0AIvxpKGYDJ4JD7bS//eUGGdYuZByqBgVOAVEC3dl7+Gin4+OLtJyjOwnlnITdgnVQHc9d28CYCBNEhDTWb7GyqlKjIdh4IWz9PPywKBR/9oT2EOALdsOnYcDKK6t1rprV1KGmhDlzog/7Bhse3c/pwyKELmzi3ZXx3QSpIzh1koe+kTqlGAwf5WZ4ElsrJh+Xjg/x0pL4ftdUz5TayVPb0Wbx1qcSOZWw3jjru/Y4K223Fyr7y3Rqk3FsC426JGyHbrmHj0ISZxJ2opNQ0gGKwdwzY8Q5aOKfj/fm7h1q1I1fMC3IDzoj0N2GwspvHWydWUdR0ydz7ggPp+g2lvT2cWprlgGhCjtvpZjFlxCLj8vGhRPG+HaIIphc7GHAV5nsiXMfu3wqBkZrFIdikJnoy0YR5Ng7th4Nr9rm8zzDljhOGSDLGXOMQqHG0/E5VO0GGSrE/bRTRZtjEX6VrvbbNn8NtLQ3ZObvj/XimXbdFpLOkLCTsHO1cfR7N7oTLcD0IdGdR8F9GTy5U21z2vrkxhlO8wgTOujklb2tFpSa4ePMAYJ+J/oY2txYobBxpYONaUrHzSpyM9vRtTrMAz1cWBBvjUJ5bUzWnhpiWF6Cm1gNUtSr4xvcqDOx0xe9zN4nyMCET5ZgeO+Yl3HYxNYkOiS1nCDDzQnW5QUZFLPPhlqN+i49owollXr0+0AN0zczUXlJG7qokzLMrrvQwhTEhHQJr9r2gdEDzBsXbGM9q2nqc+s0hs5b31r5zWAvdgVQQ8wc5Wdr/9bIABEy88Z3aRpUSjGYU+yN8ueGazO47N5cvmwn/EzNaeCtu6uZ0RwWqAW4eFKQR//dtl0lB03UCX9rSJxiMGWkH8sGaxsXjeUED7Nz6JiwhS93qcwf1/oy1vt4OSc/i20VccpbfZw3Iibqo9LKV7GhfnFQzD7OHmHw5pq2L/l+I3yMiHJhK2wtaRubHw9NTfw0795joUoE6N0yQHGIU4aGUEviuJF0g1xNodavyJEdm0hLmF1zRaKlkDiO/uKfqS7XG1LwxDwdei8/I/SIMoSZOLuaG3rHNsAg25LetsbZsMNtSr9z8GlE1MCJo+u4ckjrZ79/l513D6XnOuB0c2mMcJWtt7E82P524Rob7+2M9JUKRp3kYozatqx/t5WvY6zd/ifXMT8/pqwa4JrzXa1fChF1tznfhsKCr21URJxiRfdz8wUu+isxZQkz5exaLomMWRQKa5bbWR9K4popBnPPrmOSOaac3cMvT4uIgQZE2MSnW1TCcc6ZEaOeGflB8hLcD76dNv4dGY+vCCbPrGOGLbZsmJkXl7LlwX2UPlzC5nsP8tn3XfRtU2/bw0rL83ZM/LU1uOOmeifDsWtBC4ZNrebV4Sn6VYXGe2/l8XxZ02/DxPoyhcsGtZ4pLd/FI/N1/muZGbcjyGmTG7hhXBB7QGeXP8SQ5k9HNcQZEwI8VGJu9CEeoZMt3FZeXqdxflMom/kEH1NaVip8tdLOgTS1rc94D6dGfr4bGgvWJNH5KDQWrLXwp+GtAqUXerj4hCzW7Im+hsJt5aU1GnOntvqAVbuPv9xyiF4fZPDRAQ0tK8BFs2u5ebggFAKTHtGpl+Crpn5jFg9u9fLAyFbfc6/x1bx/c5AHF9tZXa1gyw5w1rR6bpkYjBLSYIWTe5ck9xUiwgpav3pevtXgvgUOllWqZPb2cs059VwRE0ft2ubkjUPxKlGp9UVHp5iH1vPQbJ2HN2ngFFTvsrCzOa0waOXxRRYuv8TfMnCVXuDi6Z/BX9938slBjZAtxIypddxzaqgxHdxkUJijsGyzNSou+niksxZ0dBRHJys8Vsks9HNGYYobGTpb7IKWx9nQeWe5hbgzj9IAAAirSURBVF8NjEiTVQQjJ9fw0uSI7YTK4vfyeWFwBU8VN1mQimDs7DJ2zFLY/1UhU9+0HKG5DlUWf2OnZHJDG5+q8KUxtVsJMa/YHzVYTrjOzvs7k3tJlq63880lPmY2+4nUEBcWB/jLnliBV/lsYRaLxlVzVoSv25Lv5a7rvNwVUTJQ7uRfBz38bGLEGBcK8TtyDZ1nX8hj/M8rubp5PA5FMKConv8uihvz13iMDVb+85lsliYZAhM6YOfFsJfrBrt44ObE3X/Cb+Hhdx3xX56Gzqq9KsYJrS8pRQtz9rxDnD0PCFn59b2FrQIN7FySy90jK3igqHU8jpwBLh64JUEbhMKu5bn8drWcLzIV4rmrWzMJm9Q72RMq+wg7puTrXO5cpUeP3hWBMDSW/ruAH39p5pPldvZHfnoqYDaJIx7Z4d/l4I3ytstrNtrTltqtFXi4dGB0xETpOhvfJDnmpFFr4/2d0SFh/Sa4mRInjS5c6eSWZzNY42u7rplAjY3fP53NwtoYX69JkCjow6izcfsjBfxlvY63w9AyhYqdGdzwSAH/OpDKl5qJZ57L5YXSOOFvze3wmXn62XweTVivwleLM/m6nZT4NoRM/O/ThfziG1OHnY4irLF8UT4Xv2qjXApESjoZT4elBd2dhHVee6432zbXc8sUL9P7h8gzg8+ts367jZc/z+DVPVpjR87WbK5+Gf4028PJeQZqUGPPAQsfbNOP7MwuYTOvrzBz27yItGGhsWCljXRFWg2f5Ime4cPQ+Xcy7o3I9sS4ObQsL5eNEHyxoa1QHdqcw9z7rdwwu4FLRwUYnmWghlRKy80sXe/giS8crHPDsPrGhJJmV7RqNrAlCnOj0SJ+6Ik+vDzUw/dP9jBraJDheWGyTIJwUOVQtYkNe6wsWOngza06rlQfNkVgVNv55d/MLJxRz/WTfJzUO0yWCrU1JlZucvDUIiefVbYv+qGyDL7/D5Vfn9fAvGFBelsg6Fcpq9bZuNvOKk+cjQImXnqxN58s8XD1VC9nDQ00HpsOAb9K6SETq3fYeHuZg4Vlcvq3zhBPzBWA3f9gpYBJAJsPmrn6iTa9Vm2YPMSH3WKweHObQXMlxxSCM646yGvTWj+Jw7VOLrs3ly+OjN/lOMHgypsO8PjY1kc2uD+LWQ9ksUmq31HD6aM8eAIq3+7sOJX4xZvKGNW30bekwKrBt1Hc6VRvTwDyMwxURbQZFlFy7KBkuvnxxHBUuM+25Q6WpSm1W5KI1NLzJT0Tq25Q41LpbKq3GrUmBYdJRb2OrgoKMo6jScOON9QwF11Sx2xb6yLht/LkUvMR6rSUSI4esmwGZl1Q7U4yDS2ODjf7oFvcfWZTcgpd2aDhDaqc2DtAeb2t4w0kPR/FYOIEL6NMClhDnDLJxRVDwq1ZjkJh25IsXqk5ko2USI4O+ucFMYRCeX1yAm3SRaR97IfWqKGa5vi7bFtyFrEhYEupmQkDfAzIC7Kvqqsjz0qOOIrBjDNruGdQ/Jd0oNzJnQvNaRoYSSI5dnFaDQblh9hXpRMIJRep47AYkXkoDdCaqLK9eWm2wyDXEabK1bHql1Tq9M7UGdMvgMunJrWNpAfTjovLX2XnziezWJJKeJakSyRIuks6mUxyZDBpguJBPgJB2HLQnNT1MuuCPGfUoKsHoTkO2mBNS/ydgJMGJmcjCWDNPgvugMIpQ330zz0uJ0s/dhAKldUaFV6FoIBQSKWszMKbC3M55/48XpCzXkgk7eK0GJw63IvdIli524o/Set5SGEQVWnVYAO2QlOY3fZ/0D8cZl/z78832fjt63ntVBeNSRcUD/KTlxGmol5jV4WJqgaZRSSRSI4PMm0G/XNDDCoIEgwprNptSb5zELh6egM/Oysqs+DMkb9kkQ5w4m3s3/wQK1E4GWD6cB+FmY1imwzBkMLyHVYG5AcZ0SfIlGE+gmHwBlT8cjBuiURyjGLWBVaTwGJqHOxoX5XOtlJz0pZzM6eP8Ea6QnxO+BoihhYw4GmFRoHWNcENp9fz5/eSGW+xEQHsrTRRUmWiMDNErsPAYTGO/LCZEolE0k34ggq1bpVar0Z5rUYgnLpBOrQwSFH/QKTH4aMTbscLEQKdqfB8PfwBQX+As8e6eWW5k50VqUVnGALK6nTK5IwLEolE0iE/OLU+uiNR4fnm/7bYt02KfXdzR76qwh3n1aJr0pMskUgk3cGEAX5mFXkj81O2FNXzfvP6KCfz6T9ifWEdFwO9AHplhnFYBN/stBzWRkskEsmxjsMieODKKrJsUYOr3Nbrd6xv/hHlIb78csLC4CcCgs2KftlkF3PGxhveSiKRSCSdQVXhd/Nq6J8birSeF4++g1eiysVuOOYulmJwR2Rc9G/m1nLaSJmhIJFIJF1FVeFX59QyY7iXCJ2tV1VuUGKG+o4bR/fPT/j25jkMBcY3V3jaSC/eoMrGAwmmFZZIJBJJu9gtgrsvquasMVEGr0DhmrF38FVs+YSBzteeywKTwTRgMDRO93PyED9DC0Os3mPBJ+ObJRKJJGnGD/Bz3+VVjOkfiF6h8KsJd/J0vG3aVdmV92BXHbylCM6OXO7yqby4NIN3VznwSqGWSCSShAwpDHLN9AZOH+VFiZnHWGkU54cTbduhun5+D3qWlYdRuDV2nduvsmiTjaXbrGw8YMLlk1kpEonk+MasCwblh5g40M9pI32M6hdoW0hQj8KPTvo1b7RXV9Lm73f3caGh8CSQcL7rygYNl19Jeng9iUQiOVYwaY2DJeU5w+1mUCsKi0WYGyb9lh0d1ZmSkq77KzkBhd8BtwIyOFoikUiSZ4sQ/LH4N7wSG62RiE6Zusv/TC9d4wbgB8CwztQhkUgkxwE+AR8Bzxf7eF+5J7UJz7vsi1j9F4rCKjOUxpC8AShkI+h4CluJRCI5hhAKAUXQoMB+IdimwIp6P8tm3YPvSLdNIpFIJGnm/wFBcj1ORCAitwAAAABJRU5ErkJggg==";

function getBaseUrl(request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return "https://www.startzig.com";
  return `${proto}://${host}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, founderName, ventureName } = body || {};

    if (!email || !ventureName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const baseUrl = getBaseUrl(request);
    const dashboardUrl = `${baseUrl}/dashboard`;

    const { data, error } = await resend.emails.send({
      from: "StartZig <hello@startzig.com>",
      to: [email],
      subject: `Your venture is live on StartZig 🚀`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: auto; background: white; border: 1px solid #e2e8f0; border-radius: 12px;">

          <h1 style="color: #1e293b; font-size: 22px; margin-bottom: 8px;">
            Hi${founderName ? ` ${founderName}` : ""},
          </h1>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Your venture <strong style="color: #6366f1;">${ventureName}</strong> is now live on StartZig — the complete startup ecosystem that takes you from your first idea all the way to exit.
          </p>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            You're joining as one of StartZig's Early Adopters — a founding group of builders who chose to start their journey here from day one.
          </p>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            As an Early Adopter, you're getting two benefits that won't be available to anyone who joins later:
          </p>

          <table style="margin: 20px 0; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 16px 10px 0; vertical-align: middle;">
                <img src="${BADGE_PNG}" width="120" height="40" alt="Early Adopter badge" style="display:block;"/>
              </td>
              <td style="padding: 10px 0; vertical-align: middle; color: #475569; font-size: 15px; line-height: 1.5;">
                A permanent mark on your profile that shows you were here from the beginning.
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 16px 10px 0; vertical-align: middle; font-size: 28px;">🚀</td>
              <td style="padding: 10px 0; vertical-align: middle; color: #475569; font-size: 15px; line-height: 1.5;">
                <strong>Free Builder plan for 30 days</strong> — including 100 credits for our AI Mentor and Demo Builder. No credit card. No commitment. Just build.
              </td>
            </tr>
          </table>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Before every phase and after every milestone, you'll find a message waiting for you on your dashboard — guiding your next steps and tracking your progress.
          </p>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            We hope you enjoy the journey.
          </p>

          <div style="text-align: center; margin-top: 36px;">
            <a href="${dashboardUrl}"
               style="background-color: #6366f1; color: white; padding: 14px 36px;
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-weight: bold; font-size: 16px;">
              Go to Dashboard
            </a>
          </div>

          <p style="margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center;">
            StartZig · startzig.com
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend early-adopter welcome email error:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error("send-welcome early-adopter route failed:", error);
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}
