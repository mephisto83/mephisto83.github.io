describe("MEPH/mobile/application/menu/ApplicationMenu.spec.js", function () {

    beforeEach(function () {
        jasmine.addMatchers(MEPH.customMatchers);
    });

    it('can create an application menu.', function (done) {
        MEPH.create('MEPH.mobile.application.menu.ApplicationMenu').then(function ($class) {
            var menu = new $class();

            expect(menu).theTruth('the application menu was not created.');

        }).catch(function (error) {
            expect(error).caught();
        }).then(function (x) {
            done();
        });
    });

    it(' setting opened to true will open the flyoutmenu ', function (done) {
        //Arrange
        var app, div,
          dom;
        MEPH.requires('MEPH.mobile.application.menu.ApplicationMenu', 'MEPHTests.helper.Application').then(function () {
            app = new MEPHTests.helper.Application();
            dom = app.createAppSpace(), div = document.createElement('div');
            div.innerHTML = '<applicationmenu position="left"><div class="internalstuff"></div></applicationmenu>';
            return app.create('MEPH.mobile.application.menu.ApplicationMenu', div.firstElementChild);
        }).then(function (results) {
            return app.loadViewObject([results], dom);
        }).then(function (results) {
            var applicationmenu = results.first().classInstance;
            ///Assert
            applicationmenu.opened = true;
            return applicationmenu.open().then(function () {
                //Assert

                expect(applicationmenu.isOpen()).theTruth('the menu was not open.');
                if (app) {
                    app.removeSpace();
                }
            })
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it('will get the menu providers from the MobileServices', function (done) {
        var old;
        MEPH.create('MEPH.mobile.application.menu.ApplicationMenu').then(function ($class) {
            //MEPH.mobile.application.menu.ApplicationMenuProvider
            var appmenu = new $class();
            old = MEPH.MobileServices.get;
            MEPH.MobileServices.get = function () {
                return Promise.resolve().then(function () {
                    return {
                        getMenuItemProviders: function () {
                            return Promise.resolve().then(function () { return [] });
                        }
                    }
                });
            }
            return appmenu.getMenuProviders().then(function (providers) {
                expect(providers).toBeTruthy();
            });
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            MEPH.MobileServices.get = old;
            done();
        });
    });

    it('will loadMenu by getting the collection of menu items to display for the top level', function (done) {
        MEPH.create('MEPH.mobile.application.menu.ApplicationMenu').then(function ($class) {
            //MEPH.mobile.application.menu.ApplicationMenuProvider
            var appmenu = new $class(), provider = {
                getItems: function (data, toplevel) {
                    var me = this;
                    return [{ item: 1 }, { item: 2 }];
                }
            };

            return appmenu.getMenuItems(provider, null).then(function (items) {
                expect(items.length === 2).toBeTruthy();
            });
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it(' will load menu items from the menu providers', function (done) {
        var old;
        MEPH.create('MEPH.mobile.application.menu.ApplicationMenu').then(function ($class) {
            var appmenu = new $class(), provider = {
                getItems: function (data, toplevel) {
                    var me = this;
                    return [{ item: 1 }, { item: 2 }];
                }
            };
            old = MEPH.MobileServices.get;
            MEPH.MobileServices.get = function () {
                return Promise.resolve().then(function () {
                    return {
                        getMenuItemProviders: function () {
                            return Promise.resolve().then(function () { return [provider] });
                        }
                    }
                });
            }
            return appmenu.loadMenu().then(function () {
                expect(appmenu.menusource.length === 2).toBeTruthy()
            });
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            MEPH.MobileServices.get = old;
            done();
        });
    });

    it(' can find the provider from which the item came from', function (done) {
        MEPH.create('MEPH.mobile.application.menu.ApplicationMenu').then(function ($class) {
            var appmenu = new $class(), item3 = {}, provider = {
                getItems: function (data, toplevel) {
                    var me = this;
                    return [{ item: 1 }, { item: 2 }, item3];
                }
            };
            appmenu.$providersAndItems = [{ provider: provider, items: [item3] }];
            expect(appmenu.getProviderByData(item3) === provider).theTruth('the found provider was incorrect.');
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            done();
        });
    });

    it(' a provider will provide a callback function , which is executed on click, and will return true if handled' +
        'else false. in which case the menu will assume that the top menu should be shown. ', function (done) {
            MEPH.create('MEPH.mobile.application.menu.ApplicationMenu').then(function ($class) {
                var appmenu = new $class(), item3 = {}, provider = {
                    getItems: function (data, toplevel) {
                        var me = this;
                        return [{ item: 1 }, { item: 2 }, item3];
                    },
                    itemClicked: function (data) {
                        return false;
                    }
                };
                old = MEPH.MobileServices.get;
                MEPH.MobileServices.get = function () {
                    return Promise.resolve().then(function () {
                        return {
                            getMenuItemProviders: function () {
                                return Promise.resolve().then(function () { return [provider] });
                            }
                        }
                    });
                }

                return appmenu.loadMenu().then(function () {
                    return appmenu.menuItemClicked(null, null, null, null, null, null, {
                        domEvent: {
                            data: item3
                        }
                    }).then(function () {;
                        expect(appmenu.menusource.length === 3).toBeTruthy()
                    })
                });
            }).catch(function (error) {
                expect(error || new Error('did not render as expected')).caught();
            }).then(function () {
                MEPH.MobileServices.get = old;
                done();
            });
        });
    it(' a provider will return the items to display as an array', function (done) {
        MEPH.create('MEPH.mobile.application.menu.ApplicationMenu').then(function ($class) {
            var appmenu = new $class(), item3 = {}, provider = {
                getItems: function (data, toplevel) {
                    var me = this;
                    return [{ item: 1 }, { item: 2 }, item3];
                },
                itemClicked: function (data) {
                    return [item3];
                }
            };
            old = MEPH.MobileServices.get;
            MEPH.MobileServices.get = function () {
                return Promise.resolve().then(function () {
                    return {
                        getMenuItemProviders: function () {
                            return Promise.resolve().then(function () { return [provider] });
                        }
                    }
                });
            }

            return appmenu.loadMenu().then(function () {
                return appmenu.menuItemClicked(null, null, null, null, null, null, {
                    domEvent: {
                        data: item3
                    }
                }).then(function () {;
                    expect(appmenu.menusource.length === 2).toBeTruthy()
                })
            });
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            MEPH.MobileServices.get = old;
            done();
        });
    });


    it(' a provider will return the items to display as an array, returns a promise then array', function (done) {
        MEPH.create('MEPH.mobile.application.menu.ApplicationMenu').then(function ($class) {
            var appmenu = new $class(), item3 = {}, provider = {
                getItems: function (data, toplevel) {
                    var me = this;
                    return [{ item: 1 }, { item: 2 }, item3];
                },
                itemClicked: function (data) {
                    return Promise.resolve().then(function () { return [item3] });
                }
            };
            old = MEPH.MobileServices.get;
            MEPH.MobileServices.get = function () {
                return Promise.resolve().then(function () {
                    return {
                        getMenuItemProviders: function () {
                            return Promise.resolve().then(function () { return [provider] });
                        }
                    }
                });
            }

            return appmenu.loadMenu().then(function () {
                return appmenu.menuItemClicked(null, null, null, null, null, null, {
                    domEvent: {
                        data: item3
                    }
                }).then(function () {;
                    expect(appmenu.menusource.length === 2).toBeTruthy()
                })
            });
        }).catch(function (error) {
            expect(error || new Error('did not render as expected')).caught();
        }).then(function () {
            MEPH.MobileServices.get = old;
            done();
        });
    });


    it(' a provider will provide a callback function , which is executed on click, and will return true if handled' +
        'else false. in which case the menu will assume that the top menu should be shown. initially it returns a promise', function (done) {
            MEPH.create('MEPH.mobile.application.menu.ApplicationMenu').then(function ($class) {
                var appmenu = new $class(), item3 = {}, provider = {
                    getItems: function (data, toplevel) {
                        var me = this;
                        return [{ item: 1 }, { item: 2 }, item3];
                    },
                    itemClicked: function (data) {
                        return Promise.resolve().then(function () { return false; });
                    }
                };
                old = MEPH.MobileServices.get;
                MEPH.MobileServices.get = function () {
                    return Promise.resolve().then(function () {
                        return {
                            getMenuItemProviders: function () {
                                return Promise.resolve().then(function () { return [provider] });
                            }
                        }
                    });
                }

                return appmenu.loadMenu().then(function () {
                    return appmenu.menuItemClicked(null, null, null, null, null, null, {
                        domEvent: {
                            data: item3
                        }
                    }).then(function () {;
                        expect(appmenu.menusource.length === 3).toBeTruthy()
                    })
                });
            }).catch(function (error) {
                expect(error || new Error('did not render as expected')).caught();
            }).then(function () {
                MEPH.MobileServices.get = old;
                done();
            });
        });
});