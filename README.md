usco-proto
============================

usco is Free Software and released under the [GNU Affero General Public License V3](http://www.gnu.org/licenses/agpl.html).
development
-----------
all the sub elements of the proto are in different repositories,
and available packaged as polymer elements : that is their intented
use in a client application


building a release
------------------
Various builds targets (browser, desktop, standalone or integration) are available ,
but it is advised to only build the specific version you require as some of these can
take a bit of time to generate.

Once a build is complete, you will find the resulting files in the build/target-subtarget 
folder : for example: **build/browser-integration** or **build/desktop-standalone** etc

To build the proto for **integration** into a website:

    $ grunt build:browser:integration

To build it **standalone** for usage in the browser using the provided demo index.html

    $ grunt build:browser:standalone

To build the desktop version:

    grunt build:desktop:standalone

Some optional build flags are also available
 - --minify

Licence
=======
AGPLV3
