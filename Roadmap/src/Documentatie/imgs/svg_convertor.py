import cairosvg

input_svg  = 'imgs/navdiagram1.svg'
output_pdf = 'imgs/navdiagram1.pdf'

cairosvg.svg2pdf(
    url=input_svg,
    write_to=output_pdf,
    dpi=300
)

print(f"Converted '{input_svg}' to '{output_pdf}' successfully.")
