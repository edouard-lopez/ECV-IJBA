#!/usr/bin/env make
# DESCRIPTION
#   Extract Chinese articles title from French articles
#
# USAGE
#   cd ~/cfdict/resources/script/wikipedia/ && make -f wikipedia.makefile
#
# @author: Édouard Lopez <dev+cfdict@edouard-lopez.com>

ifneq (,)
This makefile requires GNU Make.
endif

# force use of Bash
SHELL := /bin/bash


# function
today=$(shell date '+%Y-%m-%d')
contours-france=contours-france-EPCI
contours-gironde=contours-gironde-EPCI


.PHONY: default
default: france-epci-100m-shp.zip gironde-odt_epci2014-shp.zip

get-contours-france: tmp/france-epci-100m-shp.zip
get-contours-gironde: tmp/gironde-odt_epci2014-shp.zip
get-liste-centre: tmp/gironde-liste-centre.geo.json
extract-epci-id: tmp/centre-id.csv
convert2geojson: tmp/gironde-epci.geo.json
convert2topojson: tmp/gironde-epci.topo.json

# @alias: convert2topojson
# Convert from GeoJSON to TopoJSON
tmp/gironde-epci.topo.json:
	@printf "Convert...\n\tGeoJSON → TopoJSON\n"
	@topojson \
		--id-property FIRST_TITR \
		-p TITRE_EPCI -p FIRST_TITR -p FIRST_PAYS \
		--quantization 1e4 \
		--simplify-proportion 0.025 \
		tmp/gironde-epci.geo.json \
	| underscore print > tmp/gironde-epci.topo.json

# @alias: convert2geojson
# Convert from Shapefile to TopoJSON
tmp/gironde-epci.geo.json:
	@printf "Convert...\n\tShapefile → GeoJSON\n"
	ogr2ogr \
		-f GeoJSON tmp/gironde-epci.geo.json \
		${contours-gironde}/*/*.shp

# @alias: extract-epci-id
# Extract EPCI id and format them
# Ugly as shit sorry
tmp/centre-id.csv:
	@printf "Extracting...\n\tCentres\n"
	grep id tmp/gironde-epci.topo.json \
		| awk 'BEGIN{FS=":"} /"id":/{print $$2}' \
		| tr -d '",' | sed 's/^\s//' \
		| tr " '/" "-" \
		| sed 's/Œ/oe/g' \
		| tr "[A-Z]" "[a-z]" \
	> tmp/epci-id.csv
# @alias: get-liste-centre
# liste des centres de traitement des déchets de la Gironde
# Data are malformed, need human Liste des centres
tmp/gironde-liste-centre.geo.json:
	@printf "Fetching...\n\tGironde GIS data\n"
	@curl --output tmp/gironde-liste-centre.geo.json http://catalogue.datalocale.fr/geoserver/datalocale/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=odt_det_decheteries&outputFormat=json
	# http://www.datalocale.fr/drupal7/sites/default/files/ressources/Opendata_Decheteries_v2.csv

# @alias: get-contours-gironde
# EPCI de Gironde
# @source: http://catalogue.datalocale.fr/fr/dataset/odt_cg_epci2014
# @format: Shapefile
tmp/gironde-%-shp.zip: tmp ${contours-gironde}
	@printf "Fetching...\n\tGironde GIS data\n"
	@curl --output tmp/gironde-odt_epci2014-shp.zip http://catalogue.datalocale.fr//fr/storage/f/2014-04-14T153618/odt_epci2014.zip
	unzip tmp/gironde-odt_epci2014-shp.zip -d ${contours-gironde}

# @alias: get-contours-france
# EPCI de France
# @source: http://www.data.gouv.fr/fr/dataset/contours-des-epci-2014
# @format: Shapefile
tmp/france-%-shp.zip: tmp ${contours-france}
	@printf "Fetching...\n\tFrance GIS data\n"
	@curl --output tmp/france-epci-100m-shp.zip http://osm13.openstreetmap.fr/~cquest/openfla/export/epci-20140306-100m-shp.zip
	unzip tmp/france-epci-100m-shp.zip -d ${contours-france}

tmp: 
	mkdir tmp

${contours-france}: 
	mkdir ${contours-france}/

${contours-gironde}: 
	mkdir ${contours-gironde}/

# gulp: https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md#getting-started
# leaflet: https://www.npmjs.org/package/generator-leaflet
install: 
	@printf "Installing system-wide (Ubuntu)...\n"
	sudo apt-get install gdal-{bin,contrib}
	sudo npm install -g topojson underscore gulp
	@printf "Install project-wide (Ubuntu)...\n"
	npm install --save-dev topojson generator-leaflet underscore gulp
	yo leaflet
	bower install --save d3 topojson
