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
convert2geojson: tmp/gironde-epci.geo.json
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

install: 
	sudo apt-get install gdal-{bin,contrib}
	sudo npm install -g topojson