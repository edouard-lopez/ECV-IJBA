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
get-liste-centre: tmp/gironde-liste-centre.csv
get-routes-dechets: tmp/routes-dechets.csv
extract-epci-id: tmp/centre-id.csv
convert2geojson: tmp/gironde-epci.geo.json
convert2topojson: tmp/gironde-epci.topo.json
extract-adresse-centre: tmp/liste-adresse-centre.csv


# @alias get-routes-dechets
# Download data modeling trash itineraries
# @source: custom https://docs.google.com/spreadsheets/d/0As-nq3vZLtSgdHpBeFF6dExwaTZZTFVHcVJERU9CdlE/?gid=503439189
tmp/routes-dechets.csv: tmp
	@printf "Fetching...\n\tGironde Trash route data\n"
	# curl --output tmp/routes-dechets.csv https://docs.google.com/spreadsheet/ccc?key=0As-nq3vZLtSgdHpBeFF6dExwaTZZTFVHcVJERU9CdlE&export?format=csv
	ln -nf tmp/routes-dechets.csv app/

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
	ln -nf tmp/gironde-epci.topo.json app/

# @alias: convert2geojson
# Convert from Shapefile to TopoJSON
tmp/gironde-epci.geo.json:
	@printf "Convert...\n\tShapefile → GeoJSON\n"
	@ogr2ogr \
		-f GeoJSON tmp/gironde-epci.geo.json \
		${contours-gironde}/*/*.shp

# @alias: extract-epci-id
# Extract EPCI id and format them
# Ugly as shit sorry
tmp/centre-id.csv:
	@printf "Extracting...\n\tCentres\n"
	@grep id tmp/gironde-epci.topo.json \
		| awk 'BEGIN{FS=":"} /"id":/{print $$2}' \
		| tr -d '",' | sed 's/^\s//' \
		| tr " '/" "-" \
		| sed 's/Œ/oe/g' \
		| tr "[A-Z]" "[a-z]" \
	> tmp/epci-id.csv

# @alias: extract-adresse-centre
# $4:Label, $7:MOA, $8-9:Adresse 1-2,$10:CodePostal
# $9 is often empty
tmp/liste-adresse-centre.csv: tmp tmp/gironde-liste-centre.csv
	@printf "Extracting...\n\tCentres data (label, MOA, adresse, CP)\n"
	awk 'BEGIN {FS=OFS=","} {print $$4,$$7,$$8,$$9,$$10,$$43,$$44}' \
		tmp/gironde-liste-centre.csv > tmp/liste-adresse-centre.csv
	ln -nf tmp/liste-adresse-centre.csv app/

# @alias: get-liste-centre
# liste des centres de traitement des déchets de la Gironde
# Data are malformed, need human Liste des centres
# @source: custom https://docs.google.com/spreadsheets/d/1q_Y4zAxmuFZDUQYHJJDS_282HLFDQH-qKNDYRFIsVUU/
tmp/gironde-liste-centre.csv: tmp
	@printf "Fetching...\n\tGironde GIS data\n"
	@curl --output tmp/gironde-liste-centre.csv https://docs.google.com/spreadsheets/d/1q_Y4zAxmuFZDUQYHJJDS_282HLFDQH-qKNDYRFIsVUU/export?format=csv

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
